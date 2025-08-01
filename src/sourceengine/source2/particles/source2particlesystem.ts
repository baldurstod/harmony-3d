import { quat, vec3, vec4 } from 'gl-matrix';
import { TESTING } from '../../../buildoptions';
import { Entity } from '../../../entities/entity';
import { ControlPoint } from '../../common/particles/controlpoint';
import { HARD_MAX_PARTICLES } from '../../common/particles/particleconsts';
import { Source2ModelInstance } from '../export';
import { Source2SnapshotLoader } from '../loaders/source2snapshotloader';
import { Operator } from './operators/operator';
import { Source2Particle } from './source2particle';
import { Source2ParticleManager } from './source2particlemanager';
import { DEFAULT_EMITTER_INDEX } from './operators/emitters/emitter';

const DEFAULT_CONTROL_POINT_SCALE = vec3.fromValues(1, 1, 1);

export const SOURCE2_DEFAULT_RADIUS = 5;// TODO: check default value

const vec = vec3.create();

export type ControlPointConfigurationDriver = {
	attachmentName: string | null;
	entityName: string | null;
	attachType: string | null;
	controlPoint: number | null;
};

export type ControlPointConfiguration = {
	name: string;
	drivers: ControlPointConfigurationDriver[],
	//TODO: previewstate

	/*
					const drivers = controlPointConfiguration.m_drivers;
					if (drivers) {
						let i = 0;
						for (const driver of drivers) {
							const attachmentName = driver.m_attachmentName;
							if (attachmentName) {
								let attachmentInstance = (model as Source2ModelInstance)?.getAttachment(attachmentName);
								if (driver.m_entityName == 'parent') {
									attachmentInstance = (model?.parent as any)?.getAttachment?.(attachmentName) ?? attachmentInstance;
								}

								if (attachmentInstance) {
									const cp = this.getOwnControlPoint(driver.m_iControlPoint ?? i);
									attachmentInstance.addChild(cp);
									cp.step();
								} else {
									if (TESTING) {
										console.warn(`Cannot find attachment ${attachmentName}`);
									}
								}
							}
							++i;
						}
					}
						*/
};

export interface BaseProperties {
	color: vec4,
	radius: number,
	lifespan: number,
	sequenceNumber: number,
	snapshotControlPoint: number,
	snapshot: string,
	rotationSpeedRoll: number,
	controlPointConfigurations: ControlPointConfiguration[];
	//this.baseProperties = { color: vec4.fromValues(1.0, 1.0, 1.0, 1.0), radius: 5, lifespan: 1, sequenceNumber: 0, snapshotControlPoint: 0, snapshot: '', rotationSpeedRoll: 0, controlPointConfigurations: { m_drivers: [] } };
}

export const DEFAULT_MAX_PARTICLES = 1000;
export const DEFAULT_GROUP_ID = 0;

export class Source2ParticleSystem extends Entity {
	isParticleSystem = true;
	isSource2ParticleSystem = true;
	fileName: string;
	repository: string;
	#parentModel?: Entity;
	animable = true;
	resetable = true;
	speed = 1;
	isRunning = false;
	startAfterDelay = 0;
	preEmissionOperators: Operator[] = [];
	emitters: Operator[] = [];
	initializers: Operator[] = [];
	operators: Operator[] = [];
	forces: Operator[] = [];
	constraints: Operator[] = [];
	renderers: Operator[] = [];
	#controlPoints: ControlPoint[] = [];
	childSystems: Source2ParticleSystem[] = [];
	livingParticles: Source2Particle[] = [];
	poolParticles: Source2Particle[] = [];
	minBounds = vec3.create();
	maxBounds = vec3.create();
	particleCount = 0;
	// particle to emit when the system starts
	initialParticles = 0;
	disabled = false;
	baseProperties: BaseProperties;
	firstStep = false;
	currentTime = 0;
	elapsedTime = 0;
	previousElapsedTime = 0;
	maxParticles = 0;
	currentParticles = 0;
	resetDelay = 0;
	parentSystem: Source2ParticleSystem | null = null;
	isBounded = false;
	endCap = false;
	groupId = DEFAULT_GROUP_ID;

	constructor(repository: string, fileName: string, name: string) {
		super({ name: name });
		this.fileName = fileName;
		this.repository = repository;
		this.setMaxParticles(DEFAULT_MAX_PARTICLES);

		//Add first control point
		//this.getControlPoint(0);
		this.baseProperties = { color: vec4.fromValues(1.0, 1.0, 1.0, 1.0), radius: SOURCE2_DEFAULT_RADIUS, lifespan: 1, sequenceNumber: 0, snapshotControlPoint: 0, snapshot: '', rotationSpeedRoll: 0, controlPointConfigurations: [] };
	}

	async init(snapshotModifiers?: Map<string, string>) {
		await this.#initSnapshot(snapshotModifiers);

		for (const child of this.childSystems) {
			this.addChild(child);
		}

		for (const renderer of this.renderers) {
			renderer.initRenderer(this);
		}
	}

	async #initSnapshot(snapshotModifiers?: Map<string, string>) {
		//TODO : we should add a snapshotmanager to avoid loading the same file multiple time
		let snapshotFile = this.baseProperties.snapshot;
		if (snapshotModifiers?.has(snapshotFile)) {
			snapshotFile = snapshotModifiers.get(snapshotFile)!;
		}
		if (snapshotFile) {
			const snapshot = await Source2SnapshotLoader.load(this.repository, snapshotFile);
			console.debug(snapshot);
			const cp = this.getControlPoint(this.baseProperties.snapshotControlPoint);
			if (cp && snapshot) {
				//TODO : what happens when this controlPoint is inherited and has already a snapshot ?
				cp.snapshot = snapshot;
			}
		}
	}

	start() {
		if (this.disabled) return;
		if (this.isRunning) return;
		Source2ParticleManager.setActive(this);
		this.firstStep = true;

		this.#reset();
		this.#startChildren();

		this.isRunning = true;
	}

	#startChildren() {
		for (const child of this.childSystems) {
			child.start();
		}
	}

	stop() {
		this.stopChildren();
		this.isRunning = false;
		for (let i = 0; i < this.livingParticles.length; ++i) {
			const particle = this.livingParticles[i]!;
			this.poolParticles.push(particle);
			this.livingParticles.splice(i, 1);
			--i;
		}
	}

	stopChildren() {
		for (const child of this.childSystems) {
			child.stop();
		}
	}

	do(action: string, params?: any) {
		switch (action) {
			case 'reset':
				this.reset();
				break;
		}
	}

	reset() {
		this.stop();
		this.start();
	}

	#reset() {
		this.currentTime = 0;
		this.elapsedTime = 0.05;
		this.previousElapsedTime = 0.05;
		this.particleCount = 0;
		this.#resetChilds();
		this.#resetEmitters();
		//TODO: reset some operators
	}

	#resetChilds() {
		for (const child of this.childSystems) {
			child.#reset();
		}
	}

	#resetEmitters() {
		for (const emitter of this.emitters) {
			emitter.reset();
		}
	}

	#preEmission() {
		for (const operator of this.preEmissionOperators) {
			operator.operateParticle(null, this.elapsedTime);
		}
	}

	step(elapsedTime: number) {
		if (!this.isPlaying()) {
			elapsedTime = 0.0000001;
		}
		if (!this.isRunning) return;

		if (this.firstStep) {
			elapsedTime = 0.05;
		}
		this.previousElapsedTime = this.elapsedTime;

		this.elapsedTime = elapsedTime * this.speed;
		this.#preEmission();
		this.#stepControlPoint();
		if (this.firstStep) {
			this.firstStep = false;
			this.#emitInitialParticles(elapsedTime);
		}
		this.#stepEmitters();

		this.#stepOperators();
		this.currentTime += this.elapsedTime;

		this.#stepRenderers(elapsedTime);
		this.#stepChildren(elapsedTime);
		this.#recomputeBounds();
	}

	#emitInitialParticles(elapsedTime: number) {
		for (let i = 0; i < this.initialParticles; ++i) {
			this.createParticle(DEFAULT_EMITTER_INDEX, 0, elapsedTime);
		}
	}

	#stepControlPoint() {
		for (const cp of this.#controlPoints) {
			//const cp = this.controlPoints[i];
			if (cp) {// There can be empty values in controlPoints

				cp.step();
			}
			/*if (i == 0) {
				if (cp.attachmentProp) {
					const atta = cp.attachmentProp;
					if (atta) {
						this.setOrientation(atta.getWorldQuat());
					}
				}
			}*/
		}
		/*if (this.parentSystem) {
			this.setOrientation(this.parentSystem.getWorldQuaternion());
		}*/
	}

	#stepEmitters() {
		for (const emitter of this.emitters) {
			emitter.doEmit(this.elapsedTime);
		}
	}

	#stepOperators() {
		for (let i = 0; i < this.livingParticles.length; ++i) {
			const particle = this.livingParticles[i]!;
			particle.step(this.elapsedTime);
			for (const operator of this.operators) {
				//const operator = this.operators[j];
				if (operator.operateAllParticlesRemoveme) {
					if (i == 0) {//do it only once
						operator.operateParticle(this.livingParticles, this.elapsedTime);
					}
				} else {
					operator.operateParticle(particle, this.elapsedTime);
				}

				if (TESTING && isNaN(particle.position[0])) {
					throw operator;
				}

				// break the loop if the particle is dead
				if (!particle.isAlive) break;
			}

			if (!particle.isAlive) {
				this.poolParticles.push(particle);
				this.livingParticles.splice(i, 1);
				--i;
			}
		}
	}

	#stepRenderers(elapsedTime: number) {
		//TODOv3: multiple passes
		for (const renderer of this.renderers) {
			if (!renderer.disableOperator) {
				renderer.updateParticles(this, this.livingParticles, elapsedTime);
			}
		}
	}

	#stepChildren(elapsedTime: number) {
		for (const child of this.childSystems) {
			if (!child.endCap) {
				child.step(elapsedTime);
			}
		}
	}

	createParticle(emitterIndex: number, creationTime: number, elapsedTime: number) {
		if (this.livingParticles.length < this.maxParticles) {
			// first try to get one from the pool
			if (this.poolParticles.length > 0) {
				const particle = this.poolParticles.pop()!;
				//init the particle to its initial state;
				particle.reset(++this.particleCount);
				particle.cTime = creationTime;
				this.#initControlPoint(particle);
				this.#startParticle(particle, elapsedTime);
				return particle;
			}

			const particle = new Source2Particle(/*'Particle ' + */++this.particleCount, this);
			particle.cTime = creationTime;
			this.#initControlPoint(particle);
			this.#startParticle(particle, elapsedTime);
			++this.currentParticles;
			return particle;
		}
	}

	#startParticle(particle: Source2Particle, elapsedTime: number) {
		this.resetDelay = 0;

		this.livingParticles.push(particle);
		this.#preInitParticle(particle);
		particle.previousElapsedTime = elapsedTime;
		particle.start();

		// Init modifiers in a 2nd loop
		for (const initializer of this.initializers) {
			if (!initializer.initMultipleOverride()) {
				initializer.initializeParticle(particle, elapsedTime);
			}
		}
		for (const initializer of this.initializers) {
			if (initializer.initMultipleOverride()) {
				initializer.initializeParticle(particle, elapsedTime);
			}
		}
	}

	#preInitParticle(particle: Source2Particle) {
		particle.setInitialRadius(this.baseProperties.radius);
		vec4.copy(particle.color, this.baseProperties.color);
		vec4.copy(particle.initialColor, particle.color);

		particle.startAlpha = this.baseProperties.color[3];
		particle.alpha = this.baseProperties.color[3];

		particle.setInitialTTL(this.baseProperties.lifespan);
		particle.sequence = this.baseProperties.sequenceNumber;
		particle.rotationSpeedRoll = this.baseProperties.rotationSpeedRoll;
	}

	#initControlPoint(particle: Source2Particle) {
		this.getWorldPosition(particle.cpPosition);
	}

	getWorldPosition(vec = vec3.create()) {
		return vec3.zero(vec);
	}

	getWorldQuaternion(q = quat.create()) {
		return quat.identity(q);
	}

	getControlPoint(controlPointId: number): ControlPoint {
		const parentSystem = this.parentSystem;
		if (parentSystem) {
			return this.#controlPoints[controlPointId] ?? parentSystem.getControlPoint(controlPointId);//TODO: remove recursion
		}

		let controlPoint = this.#controlPoints[controlPointId];
		if (controlPoint === undefined) {
			controlPoint = this.#createControlPoint(controlPointId);
		}
		return controlPoint;
	}

	getControlPointForScale(controlPointId: number) {
		const parentSystem = this.parentSystem;
		if (parentSystem) {
			return this.#controlPoints[controlPointId] ?? parentSystem.getControlPoint(controlPointId);
		}

		let controlPoint = this.#controlPoints[controlPointId];
		if (controlPoint === undefined) {
			controlPoint = this.#createControlPoint(controlPointId);
			controlPoint.position = DEFAULT_CONTROL_POINT_SCALE;
		}
		return controlPoint;
	}

	getOwnControlPoint(controlPointId: number) {
		//return this.getControlPoint(controlPointId);
		return this.#controlPoints[controlPointId] ?? this.#createControlPoint(controlPointId);
	}

	#createControlPoint(controlPointId: number) {
		const controlPoint = new ControlPoint();
		controlPoint.name = String(controlPointId);
		this.addChild(controlPoint);
		this.#controlPoints[controlPointId] = controlPoint;

		vec3.set(controlPoint.fVector, 0, 1, 0);
		vec3.set(controlPoint.uVector, 0, 0, 1);
		vec3.set(controlPoint.rVector, 1, 0, 0);

		return controlPoint;
	}

	getControlPointPosition(cpId: number) {
		const cp = this.getControlPoint(cpId);
		if (cp) {
			return cp.getWorldPosition(vec);
		}
		return vec3.create();
	}

	setControlPointPosition(cpId: number, position: vec3) {
		const cp = this.getControlPoint(cpId);
		if (cp) {
			cp.position = position;
		}
	}

	setMaxParticles(max: number) {
		this.maxParticles = Math.max(Math.min(max, HARD_MAX_PARTICLES), 1);
	}

	stepConstraints(particle: Source2Particle) {
		//TODOv3: multiple passes
		for (const constraint of this.constraints) {
			constraint.constraintParticle(particle);
		}
	}

	#recomputeBounds() {
		const minBounds = this.minBounds;
		const maxBounds = this.maxBounds;
		vec3.set(minBounds, Infinity, Infinity, Infinity);
		vec3.set(maxBounds, -Infinity, -Infinity, -Infinity);
		this.isBounded = false;

		for (const particle of this.livingParticles) {
			vec3.min(minBounds, minBounds, particle.position);
			vec3.max(maxBounds, maxBounds, particle.position);
			this.isBounded = true;
		}
	}

	getBounds(minBounds: vec3, maxBounds: vec3) {
		vec3.copy(minBounds, this.minBounds);
		vec3.copy(maxBounds, this.maxBounds);
	}

	getBoundsCenter(center: vec3) {
		if (this.isBounded) {
			vec3.add(center, this.minBounds, this.maxBounds);
			vec3.scale(center, center, 0.5);
		} else {
			vec3.zero(center);
		}
	}

	parentChanged(parent: Entity | null) {
		if ((parent as Source2ParticleSystem)?.isSource2ParticleSystem) {
			this.parentSystem = parent as Source2ParticleSystem;
		} else {
			parent?.addChild(this.getControlPoint(0));
			this.setParentModel(parent ?? undefined);
		}
	}

	setParentModel(model?: Entity | undefined) {
		if (!(model as Source2ModelInstance)?.isSource2ModelInstance) {
			return;
		}

		this.#parentModel = model;

		this.getControlPoint(0).model = model as Source2ModelInstance;
		if (this.baseProperties.controlPointConfigurations) {
			for (const controlPointConfiguration of this.baseProperties.controlPointConfigurations) {
				/*if (controlPointConfiguration.m_name == 'point_follow')*/ {
					const drivers = controlPointConfiguration.drivers;
					if (drivers) {
						let i = 0;
						for (const driver of drivers) {
							const attachmentName = driver.attachmentName;
							if (attachmentName) {
								let attachmentInstance = (model as Source2ModelInstance)?.getAttachment(attachmentName);
								if (driver.entityName == 'parent') {
									attachmentInstance = (model?.parent as any)?.getAttachment?.(attachmentName) ?? attachmentInstance;
								}

								if (attachmentInstance) {
									const cp = this.getOwnControlPoint(driver.controlPoint ?? i);
									attachmentInstance.addChild(cp);
									cp.step();
								} else {
									if (TESTING) {
										console.warn(`Cannot find attachment ${attachmentName}`);
									}
								}
							}
							++i;
						}
					}
				}
			}
		}
	}

	getParentModel(): Entity | undefined {
		// TODO: remove recursion
		if (this.parentSystem) {
			return this.parentSystem.getParentModel();
		}
		return this.#parentModel;
	}

	getParticle(index?: number) {
		if (index == undefined) {
			index = Math.floor(Math.random() * this.livingParticles.length);
		}

		if (index >= this.livingParticles.length) {
			index = Math.floor(Math.random() * this.poolParticles.length);
			return this.poolParticles[index];
		}

		return this.livingParticles[index];
	}

	dispose() {
		super.dispose();
		this.#controlPoints.forEach(element => element.dispose());
		this.operators.forEach(element => element.dispose());
		this.renderers.forEach(element => element.dispose());
		this.childSystems.forEach(element => element.dispose());
		this.#controlPoints.length = 0;

	}

	buildContextMenu() {
		const startStop = this.isRunning ? { i18n: '#stop', f: () => this.stop() } : { i18n: '#start', f: () => this.start() };
		return Object.assign(super.buildContextMenu(), {
			Source2ParticleSystem_1: null,
			startStop: startStop,
			reset: { i18n: '#reset', f: () => this.reset() },
		});
	}

	static getEntityName() {
		return 'Source 2 particle system';
	}
}
Source2ParticleSystem.prototype.isParticleSystem = true;
Source2ParticleSystem.prototype.isSource2ParticleSystem = true;
