import { quat, vec3 } from 'gl-matrix';
import { float, int, JSONObject } from 'harmony-types';
import { HarmonyMenuItemsDict } from 'harmony-ui';
import { ERROR, WARN } from '../../../buildoptions';
import { registerEntity } from '../../../entities/entities';
import { Entity, EntityParameters } from '../../../entities/entity';
import { Loopable } from '../../../interfaces/loopable';
import { BoundingBox } from '../../../math/boundingbox';
import { ControlPoint } from '../../common/particles/controlpoint';
import { DEFAULT_MAX_PARTICLES, MAX_PARTICLES_IN_A_SYSTEM } from '../../common/particles/particleconsts';
import { MAX_FLOATS } from '../../common/particles/randomfloats';
import { CDmxAttribute } from '../loaders/source1pcfloader';
import { SourcePCF } from '../loaders/sourcepcf';
import { Source1Material } from '../materials/source1material';
import { Source1MaterialManager } from '../materials/source1materialmanager';
import { ParticleColor, WHITE } from './color';
import { PARAM_TYPE_COLOR, PARAM_TYPE_FLOAT, PARAM_TYPE_ID, PARAM_TYPE_INT, PARAM_TYPE_STRING } from './constants';
import { Source1ParticleOperator } from './operators/operator';
import { Source1Particle } from './particle';
import { BulgeControl, PathParameters } from './path';
import { RANDOM_FLOAT_MASK, randomFloats } from './randomfloats';
import { Source1ParticleControler } from './source1particlecontroler';

export const MAX_PARTICLE_CONTROL_POINTS = 64;
//const RESET_DELAY = 0;
let systemNumber = 0;

export class ParamType {
	param: string;
	type: string;
	constructor(param: string, type: string) {
		this.param = param;
		this.type = type;
	}
}

export type Source1ParticleSystemParameters = EntityParameters & {
	repository: string,
	name: string,
	id?: string
};

export class Source1ParticleSystem extends Entity implements Loopable {
	isParticleSystem = true;
	repository: string;
	#autoKill = false;
	#looping = false;
	isLoopable = true as const;
	#sequenceNumber = 0;
	#materialPromiseResolve?: (value: Source1Material) => void;
	#materialPromise?: Promise<Source1Material>;
	#renderers = new Map<string, Source1ParticleOperator>();
	#particleCount = 0;
	#randomSeed = 0;//Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
	#maximumTimeStep = 0.1;
	animable = true;
	resetable = true;
	paramList: ParamType[] = [];
	parameters: Record<string, { type?: any/*TODO: fix type*/, value?: string }> = {};
	minimumTickRate = 0;
	maximumTickRate = 1;
	// particle to emit when the system starts
	initialParticles = 0;
	currentParticles = 0;
	currentTime = 0;
	// elapsed time since last ste
	elapsedTime = 0.05;
	previousElapsedTime = 0.05;
	speed = 1;
	isRunning = false;
	radius = 1;
	//attachmentBone = null;

	// List of living particles
	#livingParticles: Source1Particle[] = [];// TODO: turn into queue ?
	// List of dead but reusable particles
	#poolParticles: Source1Particle[] = [];// TODO: turn into queue ?

	currentOrientation = quat.create();
	prevOrientation = quat.create();

	emitters: Record<string, Source1ParticleOperator> = {};//new Array();//todo transform to map
	initializers: Record<string, Source1ParticleOperator> = {};// = new Array();//todo transform to map
	operators: Record<string, Source1ParticleOperator> = {};//new Array();//todo transform to map
	forces = new Map<string, Source1ParticleOperator>();
	constraints: Record<string, Source1ParticleOperator> = {};//new Array();//todo transform to map
	#controlPoints: ControlPoint[] = [];

	#childrenSystems: Source1ParticleSystem[] = [];//todo transform to map
	tempChildren: Record<string, string> = {};//new Array();//todo transform to map
	operatorRandomSampleOffset = 0;
	parentSystem?: Source1ParticleSystem;
	firstStep = false;
	pcf?: SourcePCF;
	material?: Source1Material;
	materialName?: string;
	maxParticles: number = DEFAULT_MAX_PARTICLES;
	resetDelay = 0;
	snapshot: any/*TODO: better type*/;
	readonly system: string;

	static #speed = 1.0;
	static #simulationSteps = 1;
	//constructor(repository, parameters, id) {
	constructor(parameters: Source1ParticleSystemParameters) {
		//parameters.name = parameters.name ?? `System ${systemNumber++}`;
		super(parameters);
		this.repository = parameters.repository;
		this.system = parameters.name;
		this.addParam('max_particles', PARAM_TYPE_INT, 50);
		this.addParam('initial_particles', PARAM_TYPE_INT, 0);
		this.addParam('material', PARAM_TYPE_STRING, '');
		this.addParam('snapshot', PARAM_TYPE_STRING, '');
		this.addParam('color', PARAM_TYPE_COLOR, new ParticleColor(255, 255, 255, 255));
		this.addParam('radius', PARAM_TYPE_FLOAT, 1);
		this.addParam('name', PARAM_TYPE_STRING, parameters.name);
		this.addParam('id', PARAM_TYPE_ID, parameters.id);

		this.addParam('minimum sim tick rate', PARAM_TYPE_FLOAT, 0);
		this.addParam('maximum sim tick rate', PARAM_TYPE_FLOAT, 1);
		this.addParam('maximum time step', PARAM_TYPE_FLOAT, 0.1);

		//this.maxParticles = null;
		//this.getControlPoint(0);
		/*for (let i = 0; i < MAX_PARTICLE_CONTROL_POINTS; ++i) {
			let cp = new ControlPoint();
			cp.name = i;
			this.addChild(cp);
			this.controlPoints.push(cp);

			vec3.set(cp.fVector, 0, 1, 0);
			vec3.set(cp.uVector, 0, 0, 1);
			vec3.set(cp.rVector, 1, 0, 0);
		}*/

	}


	start(): void {
		if (this.isRunning) return;
		Source1ParticleControler.setActive(this);
		this.firstStep = true;

		this.updateChilds();

		this.#reset();
		this.#startChildren();

		//		this.emitInitialParticles();

		this.isRunning = true;
	}

	#startChildren(): void {
		for (const childrenSystem of this.#childrenSystems) {
			childrenSystem.start();
		}
	}

	stop(): void {
		this.stopChildren();
		this.isRunning = false;
		for (const particle of this.#livingParticles) {
			this.#poolParticles.push(particle);
		}
		this.#livingParticles.splice(0);
	}

	stopChildren(): void {
		for (const childrenSystem of this.#childrenSystems) {
			childrenSystem.stop();
		}
	}

	do(action: string): void {
		switch (action) {
			case 'reset':
				this.reset();
				break;
		}
	}

	reset(): void {
		this.stop();
		this.start();
	}

	#reset(): void {
		//console.log('Reset PS');
		this.currentTime = 0;
		this.elapsedTime = 0.05;
		this.previousElapsedTime = 0.05;
		this.#resetChilds();
		this.#resetEmitters();
		this.#resetInitializers();
	}

	#resetChilds(): void {
		for (const childrenSystem of this.#childrenSystems) {
			childrenSystem.#reset();
		}
	}

	#resetEmitters(): void {
		for (const i in this.emitters) {//TODOv3
			this.emitters[i]!.reset();
		}
	}

	#resetInitializers(): void {
		for (const i in this.initializers) {
			this.initializers[i]!.reset();
		}
	}

	updateChilds(): void {
		for (const i in this.tempChildren) {
			const ps = this.pcf?.getSystem(this.tempChildren[i]!);

			if (ps) {
				this.addChildSystem(ps);
				delete this.tempChildren[i];
			} else {
				if (ERROR) { console.error('System not found: ' + i); }
			}
		}
	}

	step(elapsedTime: number): void {
		if (!this.isPlaying()) {
			elapsedTime = 0.0000001;
		}
		for (let i = 0; i < Source1ParticleSystem.#simulationSteps; i++) {
			this.#step(elapsedTime / Source1ParticleSystem.#simulationSteps);
		}
	}

	#step(elapsedTime: number): void {
		if (!this.isRunning || Source1ParticleSystem.#speed == 0) {
			return
		};
		elapsedTime = Math.min(elapsedTime, this.#maximumTimeStep);
		this.previousElapsedTime = this.elapsedTime;
		this.elapsedTime = elapsedTime;
		//elapsedTime = clamp(elapsedTime, this.minimumTickRate, this.maximumTickRate);

		this.stepControlPoint();

		if (this.firstStep) {
			this.firstStep = false;
			elapsedTime = 0.05;
			this.#emitInitialParticles(elapsedTime);
		}

		this.elapsedTime = elapsedTime * this.speed * Source1ParticleSystem.#speed;
		this.#stepOperators1();
		this.stepControlPoint();
		this.#stepEmitters();
		this.currentTime += this.elapsedTime;

		//this.stepForces();
		if (!this.parentSystem) {
			this.setCpOrientation();
		} else {
			this.setCpOrientation();
		}
		this.#stepOperators();
		//this.stepConstraints();

		/*if (this.livingParticles.length == 0 && this.allowReset) {
			this.resetDelay+=this.elapsedTime;
			if (this.resetDelay>RESET_DELAY) this.reset();
		};*/
		if (this.material) {
			this.#stepRenderers(elapsedTime);
		}
		this.#stepChildren(elapsedTime);
	}

	#emitInitialParticles(elapsedTime: number): void {
		for (let i = 0; i < this.initialParticles; ++i) {
			this.createParticle(0, elapsedTime);
		}
	}

	#stepEmitters(): void {
		for (const i in this.emitters) {
			this.emitters[i]!.doEmit(this.elapsedTime);
		}
	}
	/**
	 * Step operators for each particle, killing it if necessary.
	 */
	#stepOperators(): void {
		for (let i = 0; i < this.#livingParticles.length; ++i) {
			const particle = this.#livingParticles[i]!;
			particle.step(this.elapsedTime);
			this.operatorRandomSampleOffset = 0;
			for (const j in this.operators) {
				const operator = this.operators[j]!;
				operator.operateParticle(particle, this.elapsedTime);

				// break the loop if the particle is dead
				if (!particle.isAlive) break;

				this.operatorRandomSampleOffset += 17;
			}
			//particle.step(this.elapsedTime);

			if (!particle.isAlive) {
				this.#poolParticles.push(particle);
				this.#livingParticles.splice(i, 1);
				--i;
			}
		}

		if (this.#livingParticles.length == 0) {
			for (const j in this.operators) {
				const operator = this.operators[j]!;
				switch (operator.functionName) {
					case 'set control point positions':
						operator.operateParticle(null!, this.elapsedTime);
						break;
				}
			}
			this.#checkFinished();
		}
	}

	#checkFinished(): void {
		if (this.#finished()) {
			if (this.#autoKill) {
				this.stop();
				this.remove();
				return;
			}
			if (this.#looping) {
				//TODO: add delay
				this.#reset();
			}
		}
	}

	#finished(): boolean {
		if (Object.keys(this.tempChildren).length) {
			return false;
		}

		for (const i in this.emitters) {
			const emitter = this.emitters[i]!;
			if (!emitter.finished()) {
				return false;
			}
		}
		for (const child of this.#childrenSystems) {
			if ((child.#livingParticles.length > 0) || !child.#finished()) {
				return false;
			}
		}
		return true;
	}

	#stepOperators1(): void {
		if (this.#livingParticles.length == 0) {
			for (const j in this.operators) {
				const operator = this.operators[j]!;
				switch (operator.functionName) {
					case 'set control point positions':
						operator.operateParticle(null!, this.elapsedTime);
						break;
				}
			}
		}
	}

	/**
	 * Step forces for each particle.
	 */
	stepForces(): void {
		for (const particle of this.#livingParticles) {
			//const particle = this.#livingParticles[i]!;
			for (const force of this.forces.values()) {
				//const force = this.forces[j];
				force.forceParticle(particle, this.elapsedTime);
			}
		}
	}

	stepConstraints(particle: Source1Particle): void {
		//TODOv3: multiple passes
		for (const j in this.constraints) {
			const constraint = this.constraints[j]!;
			constraint.constraintParticle(particle);
		}
	}

	#stepRenderers(elapsedTime: number): void {
		for (const [, renderer] of this.#renderers) {
			renderer.updateParticles(this, this.#livingParticles, elapsedTime);
		}
	}

	#stepChildren(elapsedTime: number): void {
		for (const child of this.#childrenSystems) {
			//const child = this.#childrenSystems[j]!;
			child.#step(elapsedTime);
		}
	}

	createParticle(creationTime: number, elapsedTime: number): Source1Particle | null {//TODOv3
		if (this.#livingParticles.length < this.maxParticles) {
			// first try to get one from the pool
			if (this.#poolParticles.length > 0) {
				const particle = this.#poolParticles.pop()!;
				//init the particle to its initial state;
				particle.reset();
				particle.cTime = creationTime;
				this.#initControlPoint(particle);
				this.#startParticle(particle, elapsedTime);
				return particle;
			}

			const particle = new Source1Particle(/*'Particle ' + */(this.#randomSeed + this.#particleCount++) % MAX_FLOATS, this);
			particle.cTime = creationTime;
			this.#initControlPoint(particle);
			this.#startParticle(particle, elapsedTime);
			++this.currentParticles;
			return particle;
		}

		//console.error('No particle has been emitted. Try to raise max particles');
		return null;
	}

	#startParticle(particle: Source1Particle, elapsedTime: number): void {
		this.resetDelay = 0;

		this.#livingParticles.push(particle);
		this.#preInitParticle(particle);
		particle.previousElapsedTime = elapsedTime;
		particle.start();

		// Init modifiers in a 2nd loop
		for (const i in this.initializers) {
			const initializer = this.initializers[i]!;
			if (!initializer.initMultipleOverride()) {
				initializer.initializeParticle(particle, elapsedTime);
			}
		}
		for (const i in this.initializers) {
			const initializer = this.initializers[i]!;
			if (initializer.initMultipleOverride()) {
				initializer.initializeParticle(particle, elapsedTime);
			}
		}
	}

	#preInitParticle(particle: Source1Particle): void {
		const radius = this.getParameter('radius') || 1;
		const color = this.getParameter('color') as ParticleColor ?? WHITE;

		particle.setInitialRadius(radius);
		particle.setInitialSequence(this.#sequenceNumber);
		particle.color.setColorAlpha(color);//TODO: remove alpha
		particle.startAlpha = color.a;
		particle.alpha = color.a;
		//particle.creationTime = this.currentTime;
	}

	#initControlPoint(particle: Source1Particle): void {
		this.getWorldPosition(particle.cpPosition);
	}

	getWorldPosition(vec = vec3.create()): vec3 {
		return vec3.zero(vec);
	}

	stepControlPoint(): void {
		for (const cp of this.#controlPoints) {
			if (cp) {
				cp.step();
			}
		}
		if (this.parentSystem) {
			this.setOrientation(this.parentSystem.getWorldQuaternion());

		}
	}

	setParam(element: CDmxAttribute): Source1ParticleSystem | null {
		if (!element) { return null; }

		const parameter = element.typeName;
		const type = element.type;
		const value = element.value;

		return this.setParameter(parameter, type, value);
	}

	addParam(param: string, type: string, value: any): void {
		this.paramList.push(new ParamType(param, type));
		this.setParameter(param, type, value);
	}

	setParameter(parameter: string, type: any/*TODO: create an enum*/, value: any): Source1ParticleSystem | null {
		if (parameter == '') return null;
		if (this.parameters[parameter] === undefined) {
			this.parameters[parameter] = {};
		}
		this.parameters[parameter].type = type;
		this.parameters[parameter].value = value;
		this.propertyChanged(parameter);
		return this;
	}

	propertyChanged(name: string): void {
		const value = this.getParameter(name);
		switch (name) {
			case 'material':
				this.setMaterialName(value);
				break;
			case 'max_particles':
				this.setMaxParticles(value);
				break;
			case 'snapshot':
				this.setSnapshot(value);
				break;
			/*
		case 'snapshot_control_point':
			this.setSnapshotCP(value);
			break;
			*/
			case 'radius':
				this.setRadius(value);
				break;
			case 'initial_particles':
				this.setInitialParticles(value);
				break;
			case 'minimum sim tick rate':
				this.setMinimumTickRate(value);
				break;
			case 'maximum sim tick rate':
				this.setMaximumTickRate(value);
				break;
			case 'maximum time step':
				this.#maximumTimeStep = value;
				break;
			case 'sequence_number':
				this.#sequenceNumber = value;
				break;
			default:
				//console.log('unknown parameter: ' + name);
				break;
		}
	}


	getParameter(parameterName: string): any {
		const parameter = this.parameters[parameterName];
		if (parameter === undefined) {
			return null;
		}

		return parameter.value;
	}

	setMaxParticles(max: number): void {
		this.maxParticles = Math.max(Math.min(max, MAX_PARTICLES_IN_A_SYSTEM), 1);
	}
	setRadius(radius: number): void {
		this.radius = radius;
	}

	setInitialParticles(initial: number): void {
		this.initialParticles = initial;
	}

	setMinimumTickRate(minimum: number): void {
		this.minimumTickRate = minimum;
	}

	setMaximumTickRate(maximum: number): void {
		this.maximumTickRate = maximum;
	}

	async setMaterialName(materialName: string): Promise<void> {
		if (!materialName || materialName === '') {
			return;
		}
		this.materialName = materialName;

		const material = await Source1MaterialManager.getMaterial(this.repository, materialName);
		if (material) {
			this.material = material;

			material.addUser(this);
			if (this.#materialPromiseResolve) {
				this.#materialPromiseResolve(material);
			}
		}
	}

	#getMaterial(): Promise<Source1Material> {
		this.#materialPromise = this.#materialPromise ?? new Promise(resolve => {
			this.#materialPromiseResolve = resolve
		});
		return this.#materialPromise;
	}

	setSnapshot(snapshot: any/*TODO: better type*/): void {
		if (!snapshot || snapshot === '') {
			return;
		}
		if (snapshot !== this.snapshot) {
			this.snapshot = snapshot;
			//this.loadSnapshot();//TODOv3
		}
	}

	addSub(type: string, object: Source1ParticleOperator, id: string): void {
		switch (type) {
			case 'operator':
			case 'operators':
				this.#addOperator(object, id);
				break;
			case 'force':
			case 'forces':
				this.#addForce(object, id);
				break;
			case 'constraint':
			case 'constraints':
				this.#addConstraint(object, id);
				break;
			case 'emitter':
			case 'emitters':
				this.#addEmitter(object, id);
				break;
			case 'initializer':
			case 'initializers':
				this.#addInitializer(object, id);
				break;
			case 'renderer':
			case 'renderers':
				this.#addRenderer(object, id);
				break;
			default:
				if (WARN) { console.warn('Unknown sub type ' + type); }
				break;
		}
	}


	#addEmitter(emitter: Source1ParticleOperator, id: string): void {
		this.emitters[id] = emitter;
	}

	#addInitializer(initializer: Source1ParticleOperator, id: string): void {
		this.initializers[id] = initializer;
	}

	#addOperator(operator: Source1ParticleOperator, id: string): void {
		this.operators[id] = operator;
	}

	/*
	removeOperator(id: string) {//TODOv3 improve
		delete this.emitters[id];
		delete this.initializers[id];
		delete this.operators[id];
		this.forces.delete(id);
		delete this.constraints[id];
		this.#renderers.delete(id);
		//delete this.childrenSystems[id];
		//this.removeChild(id);
	}
	*/


	#addForce(force: Source1ParticleOperator, id: string): void {
		this.forces.set(id, force);
	}

	#addConstraint(constraint: Source1ParticleOperator, id: string): void {
		this.constraints[id] = constraint;
	}

	#addRenderer(renderer: Source1ParticleOperator, id: string): void {
		this.#renderers.set(id, renderer);

		this.#getMaterial().then(() => renderer.initRenderer());
	}

	getControlPoint(controlPointId: number): ControlPoint | null {
		if (controlPointId < 0 || controlPointId >= MAX_PARTICLE_CONTROL_POINTS) {
			return null;
		}
		const parentSystem = this.parentSystem;
		if (parentSystem !== undefined) {
			return this.#controlPoints[controlPointId] ?? parentSystem.getControlPoint(controlPointId);
		}

		let controlPoint = this.#controlPoints[controlPointId];
		if (controlPoint === undefined) {
			controlPoint = this.#createControlPoint(controlPointId);
		}
		return controlPoint;
	}

	getControlPoints(): ControlPoint[] {
		return this.#controlPoints;
	}

	getOwnControlPoint(controlPointId: number): ControlPoint {
		return this.#controlPoints[controlPointId] ?? this.#createControlPoint(controlPointId);
	}

	#createControlPoint(controlPointId: number): ControlPoint {
		const controlPoint = new ControlPoint();
		controlPoint.name = String(controlPointId);
		if (controlPointId == 0) {
			this.addChild(controlPoint);
		} else {
			//Attach to first control point
			//this.getControlPoint(0).addChild(controlPoint);
			this.addChild(controlPoint);
		}
		this.#controlPoints[controlPointId] = controlPoint;

		vec3.set(controlPoint.fVector, 0, 1, 0);
		vec3.set(controlPoint.uVector, 0, 0, 1);
		vec3.set(controlPoint.rVector, 1, 0, 0);

		const parentSystem = this.parentSystem;
		if (parentSystem !== undefined) {
			const parentControlPoint = parentSystem.getControlPoint(controlPointId);
			if (parentControlPoint) {
				controlPoint.parentControlPoint = parentControlPoint;
			}
		}

		return controlPoint;
	}

	addTempChild(name: string, id: string): void {
		this.tempChildren[id] = name;
	}

	addChildSystem(particleSystem: Source1ParticleSystem): void {
		this.#childrenSystems.push(particleSystem);
		particleSystem.setParent(this);
		this.addChild(particleSystem);
		particleSystem.serializable = false;

		/*let parentControlPoint = this.getControlPoint(0);
		let childControlPoint = particleSystem.getControlPoint(0);
		parentControlPoint.addChild(childControlPoint);*/

		/*for (let i = 0; i < MAX_PARTICLE_CONTROL_POINTS; ++i) {
			let parentCp = this.controlPoints[i];
			let childCp = particleSystem.controlPoints[i];
			parentCp.addChild(childCp);
		}*/

		//particleSystem.setSkyBox(this.skybox);TODOv3
	}

	setParent(parentSystem: Source1ParticleSystem): Source1ParticleSystem {
		return this.parentSystem = parentSystem;
	}

	/**
	 * Orient all particles relative to control point #0.
	 */
	setCpOrientation(): void {
		return;//TODOV3
		/*
		const cp = this.getControlPoint(0);
		if (cp) {
			const orientation = cp.getWorldQuaternion();
			for (let i = 0; i < this.livingParticles.length; ++i) {
				const particle = this.livingParticles[i];
				quat.copy(particle.cpOrientation, orientation);
				quat.copy(particle.cpOrientation, this.getWorldQuaternion());
			}
		}*/
	}
	/**
	 * Set control point orientation
	 * @param (Object quat) orientation New orientation
	 */
	setOrientation(orientation: quat): void {
		quat.copy(this.prevOrientation, this.currentOrientation);
		quat.copy(this.currentOrientation, orientation);
	}

	setChildControlPointPosition(first: number, last: number, position: vec3): void {
		for (const child of this.#childrenSystems) {
			for (let cpId = first; cpId <= last; ++cpId) {
				const cp = child.getOwnControlPoint(cpId);
				if (cp) {
					cp.setPosition(position);
					//The control point is now world positioned
					//Therefore we remove it from the hierarchy
					//cp.remove();
				}
			}
		}
	}

	setChildControlPointOrientation(first: number, last: number, orientation: quat): void {
		for (const child of this.#childrenSystems) {
			for (let cpId = first; cpId <= last; ++cpId) {
				const cp = child.getOwnControlPoint(cpId);
				if (cp) {
					cp.setQuaternion(orientation);
					//The control point is now world positioned
					//Therefore we remove it from the hierarchy
					//cp.remove();
				}
			}
		}
	}

	getParticle(index?: number): Source1Particle | null {
		if (index == undefined) {
			index = Math.floor(Math.random() * this.#livingParticles.length);
		}

		/*if (index >= this.livingParticles.length) {
			index = Math.floor(Math.random() * this.poolParticles.length);
			return this.poolParticles[index];
		}*/

		return this.#livingParticles[index] ?? null;
	}


	getControlPointPosition(cpId: number): vec3 {
		const cp = this.getControlPoint(cpId);
		if (cp) {
			return cp.getWorldPosition();
		}
		return vec3.create();
	}

	setControlPointPosition(cpId: number, position: vec3): void {
		const cp = this.getOwnControlPoint(cpId);
		if (cp) {
			cp.setPosition(position);
		}
	}

	setControlPointParent(/*controlPointId: number, parentControlPointId: number*/): void {
		// TODO: this function does nothing ????
		//const controlPoint = this.getControlPoint(controlPointId);

		const parentSystem = this.parentSystem;
		if (parentSystem !== undefined) {
			//parentSystem.getControlPoint(parentControlPointId).addChild(controlPoint);
		} else {
			//this.getControlPoint(parentControlPointId).addChild(controlPoint);
		}
		/*
				if (cp && cpParent) {
					cp.setParent(cpParent);
				}*/

		// Not sure it should be done resursively ?
		// This function is only used in 'set control point positions'
		/*for (let child of this.childrenSystems) {
			child.setControlPointParent(controlPointId, parentControlPointId);
		}*/
	}

	getWorldQuaternion(q = quat.create()): quat {
		quat.copy(q, this._quaternion);
		return q;
	}

	getBoundingBox(boundingBox = new BoundingBox()): BoundingBox {
		boundingBox.reset();
		return boundingBox;
	}

	set autoKill(autoKill) {
		this.#autoKill = autoKill;
	}

	get autoKill(): boolean {
		return this.#autoKill;
	}

	setLooping(looping: boolean): void {
		this.#looping = looping;
	}

	getLooping(): boolean {
		return this.#looping;
	}

	dispose(): void {
		super.dispose();
		this.#controlPoints.forEach(element => element.dispose());
		this.#controlPoints.length = 0;
		this.material?.removeUser(this);

		for (const [, renderer] of this.#renderers) {
			renderer.dispose();
		}

		for (const child of this.#childrenSystems) {
			child.dispose();
		}
	}

	getBounds(min = vec3.create(), max = vec3.create()): void {
		if (!this.#livingParticles.length) {
			vec3.set(min, -1, -1, -1);
			vec3.set(max, 1, 1, 1);
		} else {
			vec3.set(min, Infinity, Infinity, Infinity);
			vec3.set(max, -Infinity, -Infinity, -Infinity);
			for (const particle of this.#livingParticles) {
				vec3.min(min, min, particle.position);
				vec3.max(max, max, particle.position);
			}
		}
	}

	static setSpeed(speed: number): void {
		Source1ParticleSystem.#speed = speed;
	}

	static setSimulationSteps(simulationSteps: number): void {
		simulationSteps = Math.round(simulationSteps);
		if (simulationSteps > 0 && simulationSteps <= 10) {
			Source1ParticleSystem.#simulationSteps = simulationSteps;
		}
	}

	getChildrenSystems(): Source1ParticleSystem[] {
		return this.#childrenSystems;
	}

	getActiveParticlesCount(): number {
		return this.#livingParticles.length;//TODO: optimize
	}

	randomVector(randomSampleId: int, min: float, max: float, out: vec3): void {
		const delta = max - min;
		const nBaseId = this.#randomSeed + randomSampleId;

		out[0] = randomFloats[(nBaseId + 0) & RANDOM_FLOAT_MASK]! * delta + min;
		out[1] = randomFloats[(nBaseId + 1) & RANDOM_FLOAT_MASK]! * delta + min;
		out[2] = randomFloats[(nBaseId + 2) & RANDOM_FLOAT_MASK]! * delta + min;
	}

	calculatePathValues(pathIn: PathParameters, timeStamp: float, startPnt: vec3, midPnt: vec3, endPnt: vec3): void {
		// TODO: use timeStamp to get control point at time
		const startControlPoint = this.getControlPoint(pathIn.startControlPointNumber);
		const endControlPoint = this.getControlPoint(pathIn.endControlPointNumber);

		if (!startControlPoint || !endControlPoint) {
			return;
		}

		startControlPoint.getWorldPosition(startPnt);
		endControlPoint.getWorldPosition(endPnt);

		vec3.lerp(midPnt, startPnt, endPnt, pathIn.midPoint);
		if (pathIn.bulgeControl != BulgeControl.Random) {
			const target = vec3.sub(vec3.create(), endPnt, startPnt);// TODO: optimize vec3.create()
			let bulgeScale = 0.0;
			let cp = startControlPoint;
			if (pathIn.bulgeControl == BulgeControl.OrientationOfEndPoint) {
				cp = endControlPoint;
			}
			//const controlPointOrientation: quat = cp.getWorldQuaternion();// TODO: optimize pass a quat
			const fwd = cp.getForwardVector();// TODO: optimize pass a vec3
			const len = vec3.len(target);
			if (len > 1.0e-6) {
				vec3.scale(target, target, 1. / len);
				bulgeScale = 1.0 - Math.abs(vec3.dot(target, fwd)); // bulge inversely scaled
			}

			const flOffsetDist = vec3.len(fwd);
			if (flOffsetDist > 1.0e-6) {
				vec3.scale(fwd, fwd, (pathIn.bulge * len * bulgeScale) / flOffsetDist);
				vec3.add(midPnt, midPnt, fwd);
			}
		} else {
			const rndVector = vec3.create();
			this.randomVector(0, -pathIn.bulge, pathIn.bulge, rndVector);
			vec3.add(midPnt, midPnt, rndVector);
		}
	}

	buildContextMenu(): HarmonyMenuItemsDict {
		const startStop = this.isRunning ? { i18n: '#stop', f: (): void => this.stop() } : { i18n: '#start', f: (): void => this.start() };

		return Object.assign(super.buildContextMenu(), {
			SourceEngineParticleSystem_1: null,
			startStop: startStop,
			reset: { i18n: '#reset', f: () => this.reset() },
		});
	}

	toJSON(): JSONObject {
		const json = super.toJSON();
		json.repository = this.repository;
		if (!this.isRunning) {
			json.isrunning = false;
		}

		const jControlPoint: string[] = [];
		this.#controlPoints.forEach((element, index) => jControlPoint[index] = element.id);
		json.controlpoints = jControlPoint;
		return json;
	}

	static async constructFromJSON(json: any/*TODO: better type*/, entities: Map<string, Entity>, loadedPromise: Promise<void>): Promise<Source1ParticleSystem | null> {
		const entity = await Source1ParticleControler.createSystem(json.repository, json.name);
		if (entity) {
			loadedPromise.then(() => {
				console.error(entities);

				const jControlPoint = json.controlpoints;
				if (jControlPoint) {
					for (let i = 0; i < jControlPoint.length; ++i) {
						const cpEntity = entities.get(jControlPoint[i]) as ControlPoint;
						if (cpEntity) {
							entity.#controlPoints[i] = cpEntity;
						}
					}
				}

				if (json.isrunning !== false) {
					entity.start();
				}
			});
		}

		return entity;
	}

	static getEntityName(): string {
		return 'Source1ParticleSystem';
	}
}
Source1ParticleSystem.prototype.isParticleSystem = true;
registerEntity(Source1ParticleSystem);
Source1ParticleControler.setParticleConstructor(Source1ParticleSystem);
