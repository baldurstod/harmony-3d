import { quat, vec3, vec4 } from 'gl-matrix';
import { Source2Particle } from './source2particle';
import { Source2ParticleManager } from './source2particlemanager';
import { Source2SnapshotLoader } from '../loaders/source2snapshotloader';
import { ControlPoint } from '../../common/particles/controlpoint';
import { DEFAULT_MAX_PARTICLES, HARD_MAX_PARTICLES } from '../../common/particles/particleconsts';
import { Entity } from '../../../entities/entity';
import { TESTING } from '../../../buildoptions';
import { Operator } from './operators/operator';
import { Source2ModelInstance } from '../export';

const DEFAULT_CONTROL_POINT_SCALE = vec3.fromValues(1, 1, 1);

let vec = vec3.create();

export type BaseProperties = {
	color: vec4,
	radius: number,
	lifespan: number,
	sequenceNumber: number,
	snapshotControlPoint: number,
	snapshot: string,
	rotationSpeedRoll: number,
	controlPointConfigurations: Array<{
		m_drivers?: Array<any>,

	}>
	//this.baseProperties = { color: vec4.fromValues(1.0, 1.0, 1.0, 1.0), radius: 5, lifespan: 1, sequenceNumber: 0, snapshotControlPoint: 0, snapshot: '', rotationSpeedRoll: 0, controlPointConfigurations: { m_drivers: [] } };
}

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
	preEmissionOperators: Array<Operator> = [];
	emitters: Array<Operator> = [];
	initializers: Array<Operator> = [];
	operators: Array<Operator> = [];
	forces = [];
	constraints: Array<Operator> = [];
	renderers: Array<Operator> = [];
	controlPoints: Array<ControlPoint> = [];
	childSystems: Array<Source2ParticleSystem> = [];
	livingParticles: Array<Source2Particle> = [];
	poolParticles: Array<Source2Particle> = [];
	minBounds = vec3.create();
	maxBounds = vec3.create();
	particleCount = 0;
	// particle to emit when the system starts
	initialParticles = 0;
	disabled = false;
	baseProperties: BaseProperties;
	firstStep = false;
	currentTime: number = 0;
	elapsedTime: number = 0;
	previousElapsedTime: number = 0;
	maxParticles: number = 0;
	currentParticles: number = 0;
	resetDelay: number = 0;
	parentSystem: Source2ParticleSystem | null = null;
	isBounded = false;
	endCap = false;

	constructor(repository: string, fileName: string, name: string) {
		super({ name: name });
		this.fileName = fileName;
		this.repository = repository;
		this.setMaxParticles(DEFAULT_MAX_PARTICLES);

		//Add first control point
		//this.getControlPoint(0);
		this.baseProperties = { color: vec4.fromValues(1.0, 1.0, 1.0, 1.0), radius: 5, lifespan: 1, sequenceNumber: 0, snapshotControlPoint: 0, snapshot: '', rotationSpeedRoll: 0, controlPointConfigurations: [] };
	}

	async init(snapshotModifiers?: Map<string, string>) {
		await this.#initSnapshot(snapshotModifiers);

		for (let child of this.childSystems) {
			this.addChild(child);
		}

		for (let renderer of this.renderers) {
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
			let snapshot = await Source2SnapshotLoader.load(this.repository, snapshotFile);
			console.debug(snapshot);
			let cp = this.getControlPoint(this.baseProperties.snapshotControlPoint);
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
		for (let i = 0; i < this.childSystems.length; ++i) {
			this.childSystems[i].start();
		}
	}

	stop() {
		this.stopChildren();
		this.isRunning = false;
		for (let i = 0; i < this.livingParticles.length; ++i) {
			const particle = this.livingParticles[i];
			this.poolParticles.push(particle);
			this.livingParticles.splice(i, 1);
			--i;
		}
	}

	stopChildren() {
		for (let i = 0; i < this.childSystems.length; ++i) {
			this.childSystems[i].stop();
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
		for (let i = 0; i < this.childSystems.length; ++i) {
			this.childSystems[i].#reset();
		}
	}

	#resetEmitters() {
		for (let emitter of this.emitters) {
			emitter.reset();
		}
	}

	#preEmission() {
		for (let operator of this.preEmissionOperators) {
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
		this.stepControlPoint();
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
			this.createParticle(0, elapsedTime);
		}
	}

	stepControlPoint() {
		for (let i in this.controlPoints) {
			const cp = this.controlPoints[i];
			cp.step();
			/*if (i == 0) {
				if (cp.attachementProp) {
					const atta = cp.attachementProp;
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
		for (let emitter of this.emitters) {
			emitter.doEmit(this.elapsedTime);
		}
	}

	#stepOperators() {
		for (let i = 0; i < this.livingParticles.length; ++i) {
			const particle = this.livingParticles[i];
			particle.step(this.elapsedTime);
			for (let operator of this.operators) {
				//const operator = this.operators[j];
				if (operator.operateAllParticlesRemoveme) {
					if (i == 0) {//do it only once
						operator.operateParticle(this.livingParticles, this.elapsedTime);
					}
				} else {
					operator.operateParticle(particle, this.elapsedTime);
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
		for (let renderer of this.renderers) {
			if (!renderer.disableOperator) {
				renderer.updateParticles(this, this.livingParticles, elapsedTime);
			}
		}
	}

	#stepChildren(elapsedTime: number) {
		for (let child of this.childSystems) {
			if (!child.endCap) {
				child.step(elapsedTime);
			}
		}
	}

	createParticle(creationTime: number, elapsedTime: number) {
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
		for (let i in this.initializers) {
			const initializer = this.initializers[i];
			if (!initializer.initMultipleOverride()) {
				initializer.initializeParticle(particle, elapsedTime);
			}
		}
		for (let i in this.initializers) {
			const initializer = this.initializers[i];
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
		let parentSystem = this.parentSystem;
		if (parentSystem) {
			return this.controlPoints[controlPointId] ?? parentSystem.getControlPoint(controlPointId);//TODO: remove recursion
		}

		let controlPoint = this.controlPoints[controlPointId];
		if (controlPoint === undefined) {
			controlPoint = this.#createControlPoint(controlPointId);
		}
		return controlPoint;
	}

	getControlPointForScale(controlPointId: number) {
		let parentSystem = this.parentSystem;
		if (parentSystem) {
			return this.controlPoints[controlPointId] ?? parentSystem.getControlPoint(controlPointId);
		}

		let controlPoint = this.controlPoints[controlPointId];
		if (controlPoint === undefined) {
			controlPoint = this.#createControlPoint(controlPointId);
			controlPoint.position = DEFAULT_CONTROL_POINT_SCALE;
		}
		return controlPoint;
	}

	getOwnControlPoint(controlPointId: number) {
		//return this.getControlPoint(controlPointId);
		return this.controlPoints[controlPointId] ?? this.#createControlPoint(controlPointId);
	}

	#createControlPoint(controlPointId: number) {
		let controlPoint = new ControlPoint();
		controlPoint.name = String(controlPointId);
		this.addChild(controlPoint);
		this.controlPoints[controlPointId] = controlPoint;

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
		for (let j in this.constraints) {
			const constraint = this.constraints[j];
			constraint.constraintParticle(particle);
		}
	}

	#recomputeBounds() {
		let minBounds = this.minBounds;
		let maxBounds = this.maxBounds;
		vec3.set(minBounds, Infinity, Infinity, Infinity);
		vec3.set(maxBounds, -Infinity, -Infinity, -Infinity);
		this.isBounded = false;

		for (let particle of this.livingParticles) {
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
			for (let controlPointConfiguration of this.baseProperties.controlPointConfigurations) {
				/*if (controlPointConfiguration.m_name == 'point_follow')*/ {
					let drivers = controlPointConfiguration.m_drivers;
					if (drivers) {
						let i = 0;
						for (let driver of drivers) {
							const attachmentName = driver.m_attachmentName;
							if (attachmentName) {
								let attachementInstance = (model as Source2ModelInstance)?.getAttachement(attachmentName);
								if (driver.m_entityName == 'parent') {
									attachementInstance = (model?.parent as any)?.getAttachement?.(attachmentName) ?? attachementInstance;
								}

								if (attachementInstance) {
									let cp = this.getOwnControlPoint(driver.m_iControlPoint ?? i);
									attachementInstance.addChild(cp);
									cp.step();
								} else {
									if (TESTING) {
										console.warn(`Cannot find attachement ${attachmentName}`);
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
		this.controlPoints.forEach(element => element.dispose());
		this.operators.forEach(element => element.dispose());
		this.renderers.forEach(element => element.dispose());
		this.childSystems.forEach(element => element.dispose());
		this.controlPoints.length = 0;

	}

	buildContextMenu() {
		let startStop = this.isRunning ? { i18n: '#stop', f: () => this.stop() } : { i18n: '#start', f: () => this.start() };
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
