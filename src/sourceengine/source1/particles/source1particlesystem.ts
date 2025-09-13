import { quat, vec3 } from 'gl-matrix';
import { ERROR, WARN } from '../../../buildoptions';
import { registerEntity } from '../../../entities/entities';
import { Entity } from '../../../entities/entity';
import { Loopable } from '../../../interfaces/loopable';
import { BoundingBox } from '../../../math/boundingbox';
import { ControlPoint } from '../../common/particles/controlpoint';
import { DEFAULT_MAX_PARTICLES, HARD_MAX_PARTICLES } from '../../common/particles/particleconsts';
import { MAX_FLOATS } from '../../common/particles/randomfloats';
import { CDmxAttribute } from '../loaders/source1pcfloader';
import { SourcePCF } from '../loaders/sourcepcf';
import { Source1Material } from '../materials/source1material';
import { Source1MaterialManager } from '../materials/source1materialmanager';
import { ParticleColor, WHITE } from './color';
import { PARAM_TYPE_COLOR, PARAM_TYPE_FLOAT, PARAM_TYPE_ID, PARAM_TYPE_INT, PARAM_TYPE_STRING } from './constants';
import { Source1ParticleOperator } from './operators/operator';
import { Source1Particle } from './particle';
import { Source1ParticleControler } from './source1particlecontroler';

export const MAX_PARTICLE_CONTROL_POINTS = 64;
const RESET_DELAY = 0;
let systemNumber = 0;

export class ParamType {
	param: string;
	type: string;
	constructor(param: string, type: string) {
		this.param = param;
		this.type = type;
	}
}

export class Source1ParticleSystem extends Entity implements Loopable {
	isParticleSystem = true;
	repository: string;
	#autoKill = false;
	#looping = false;
	isLoopable: true = true;
	#sequenceNumber = 0;
	#materialPromiseResolve?: (value: Source1Material) => void;
	#materialPromise?: Promise<Source1Material>;
	#renderers = new Map<string, Source1ParticleOperator>();
	#particleCount = 0;
	#randomSeed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
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

	static #speed = 1.0;
	static #simulationSteps = 1;
	//constructor(repository, parameters, id) {
	constructor(params?: any) {
		params.name = params.name ?? `System ${systemNumber++}`;
		super(params);
		this.repository = params.repository;
		this.addParam('max_particles', PARAM_TYPE_INT, 50);
		this.addParam('initial_particles', PARAM_TYPE_INT, 0);
		this.addParam('material', PARAM_TYPE_STRING, '');
		this.addParam('snapshot', PARAM_TYPE_STRING, '');
		this.addParam('color', PARAM_TYPE_COLOR, new ParticleColor(255, 255, 255, 255));
		this.addParam('radius', PARAM_TYPE_FLOAT, 1);
		this.addParam('name', PARAM_TYPE_STRING, params.name);
		this.addParam('id', PARAM_TYPE_ID, params.id);

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


	start() {
		if (this.isRunning) return;
		Source1ParticleControler.setActive(this);
		this.firstStep = true;

		this.updateChilds();

		this.#reset();
		this.#startChildren();

		//		this.emitInitialParticles();

		this.isRunning = true;
	}

	#startChildren() {
		for (const childrenSystem of this.#childrenSystems) {
			childrenSystem.start();
		}
	}

	stop() {
		this.stopChildren();
		this.isRunning = false;
		for (const particle of this.#livingParticles) {
			this.#poolParticles.push(particle);
		}
		this.#livingParticles.splice(0);
	}

	stopChildren() {
		for (const childrenSystem of this.#childrenSystems) {
			childrenSystem.stop();
		}
	}

	do(action: string, params: any) {
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
		//console.log('Reset PS');
		this.currentTime = 0;
		this.elapsedTime = 0.05;
		this.previousElapsedTime = 0.05;
		this.#resetChilds();
		this.#resetEmitters();
		this.#resetInitializers();
	}

	#resetChilds() {
		for (const childrenSystem of this.#childrenSystems) {
			childrenSystem.#reset();
		}
	}

	#resetEmitters() {
		for (const i in this.emitters) {//TODOv3
			this.emitters[i]!.reset();
		}
	}

	#resetInitializers() {
		for (const i in this.initializers) {
			this.initializers[i]!.reset();
		}
	}

	updateChilds() {
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

	step(elapsedTime: number) {
		if (!this.isPlaying()) {
			elapsedTime = 0.0000001;
		}
		for (let i = 0; i < Source1ParticleSystem.#simulationSteps; i++) {
			this.#step(elapsedTime / Source1ParticleSystem.#simulationSteps);
		}
	}

	#step(elapsedTime: number) {
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

	#emitInitialParticles(elapsedTime: number) {
		for (let i = 0; i < this.initialParticles; ++i) {
			this.createParticle(0, elapsedTime);
		}
	}

	#stepEmitters() {
		for (const i in this.emitters) {
			this.emitters[i]!.doEmit(this.elapsedTime);
		}
	}
	/**
	 * Step operators for each particle, killing it if necessary.
	 */
	#stepOperators() {
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

	#checkFinished() {
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

	#stepOperators1() {
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
	stepForces() {
		for (let i = 0; i < this.#livingParticles.length; ++i) {
			const particle = this.#livingParticles[i]!;
			for (const force of this.forces.values()) {
				//const force = this.forces[j];
				force.forceParticle(particle, this.elapsedTime);
			}
		}
	}

	stepConstraints(particle: Source1Particle) {
		//TODOv3: multiple passes
		for (const j in this.constraints) {
			const constraint = this.constraints[j]!;
			constraint.constraintParticle(particle);
		}
	}

	#stepRenderers(elapsedTime: number) {
		for (const [_, renderer] of this.#renderers) {
			renderer.updateParticles(this, this.#livingParticles, elapsedTime);
		}
	}

	#stepChildren(elapsedTime: number) {
		for (const j in this.#childrenSystems) {//TODOv3
			const child = this.#childrenSystems[j]!;
			child.#step(elapsedTime);
		}
	}

	createParticle(creationTime: number, elapsedTime: number) {//TODOv3
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

	#startParticle(particle: Source1Particle, elapsedTime: number) {
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

	#preInitParticle(particle: Source1Particle) {
		const radius = this.getParameter('radius') || 1;
		const color = this.getParameter('color') as ParticleColor ?? WHITE;

		particle.setInitialRadius(radius);
		particle.setInitialSequence(this.#sequenceNumber);
		particle.color.setColorAlpha(color);//TODO: remove alpha
		particle.startAlpha = color.a;
		particle.alpha = color.a;
		//particle.creationTime = this.currentTime;
	}

	#initControlPoint(particle: Source1Particle) {
		this.getWorldPosition(particle.cpPosition);
	}

	getWorldPosition(vec = vec3.create()) {
		return vec3.zero(vec);
	}

	stepControlPoint() {
		for (let i = 0; i < this.#controlPoints.length; i++) {
			const cp = this.#controlPoints[i];
			if (!cp) {
				continue;
			}
			cp.step();
		}
		if (this.parentSystem) {
			this.setOrientation(this.parentSystem.getWorldQuaternion());

		}
	}
	setParam(element: CDmxAttribute) {
		if (!element) { return null; }

		const parameter = element.typeName;
		const type = element.type;
		const value = element.value;

		return this.setParameter(parameter, type, value);
	}

	addParam(param: string, type: string, value: any) {
		this.paramList.push(new ParamType(param, type));
		this.setParameter(param, type, value);
	}

	setParameter(parameter: string, type: any/*TODO: create an enum*/, value: any) {
		if (parameter == '') return;
		if (this.parameters[parameter] === undefined) {
			this.parameters[parameter] = {};
		}
		this.parameters[parameter].type = type;
		this.parameters[parameter].value = value;
		this.propertyChanged(parameter);
		return this;
	}

	propertyChanged(name: string) {
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

	setMaxParticles(max: number) {
		this.maxParticles = Math.max(Math.min(max, HARD_MAX_PARTICLES), 1);
	}
	setRadius(radius: number) {
		this.radius = radius;
	}

	setInitialParticles(initial: number) {
		this.initialParticles = initial;
	}

	setMinimumTickRate(minimum: number) {
		this.minimumTickRate = minimum;
	}

	setMaximumTickRate(maximum: number) {
		this.maximumTickRate = maximum;
	}

	async setMaterialName(materialName: string) {
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

	#getMaterial() {
		this.#materialPromise = this.#materialPromise ?? new Promise(resolve => {
			this.#materialPromiseResolve = resolve
		});
		return this.#materialPromise;
	}

	setSnapshot(snapshot: any/*TODO: better type*/) {
		if (!snapshot || snapshot === '') {
			return;
		}
		if (snapshot !== this.snapshot) {
			this.snapshot = snapshot;
			//this.loadSnapshot();//TODOv3
		}
	}

	addSub(type: string, object: Source1ParticleOperator, id: string) {
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


	#addEmitter(emitter: Source1ParticleOperator, id: string) {
		this.emitters[id] = emitter;
	}

	#addInitializer(initializer: Source1ParticleOperator, id: string) {
		this.initializers[id] = initializer;
	}

	#addOperator(operator: Source1ParticleOperator, id: string) {
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


	#addForce(force: Source1ParticleOperator, id: string) {
		this.forces.set(id, force);
	}

	#addConstraint(constraint: Source1ParticleOperator, id: string) {
		this.constraints[id] = constraint;
	}

	#addRenderer(renderer: Source1ParticleOperator, id: string) {
		this.#renderers.set(id, renderer);

		this.#getMaterial().then((material) => renderer.initRenderer());
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

	getOwnControlPoint(controlPointId: number) {
		return this.#controlPoints[controlPointId] ?? this.#createControlPoint(controlPointId);
	}

	#createControlPoint(controlPointId: number) {
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

	addTempChild(name: string, id: string) {
		this.tempChildren[id] = name;
	}

	addChildSystem(particleSystem: Source1ParticleSystem) {
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

	setParent(parentSystem: Source1ParticleSystem) {
		return this.parentSystem = parentSystem;
	}

	/**
	 * Orient all particles relative to control point #0.
	 */
	setCpOrientation() {
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
	setOrientation(orientation: quat) {
		quat.copy(this.prevOrientation, this.currentOrientation);
		quat.copy(this.currentOrientation, orientation);
	}

	setChildControlPointPosition(first: number, last: number, position: vec3) {
		for (const child of this.#childrenSystems) {
			for (let cpId = first; cpId <= last; ++cpId) {
				const cp = child.getOwnControlPoint(cpId);
				if (cp) {
					cp.position = position;
					//The control point is now world positioned
					//Therefore we remove it from the hierarchy
					//cp.remove();
				}
			}
		}
	}

	setChildControlPointOrientation(first: number, last: number, orientation: quat) {
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

	getParticle(index?: number) {
		if (index == undefined) {
			index = Math.floor(Math.random() * this.#livingParticles.length);
		}

		/*if (index >= this.livingParticles.length) {
			index = Math.floor(Math.random() * this.poolParticles.length);
			return this.poolParticles[index];
		}*/

		return this.#livingParticles[index];
	}


	getControlPointPosition(cpId: number) {
		const cp = this.getControlPoint(cpId);
		if (cp) {
			return cp.getWorldPosition();
		}
		return vec3.create();
	}

	setControlPointPosition(cpId: number, position: vec3) {
		const cp = this.getOwnControlPoint(cpId);
		if (cp) {
			cp.position = position;
		}
	}

	setControlPointParent(controlPointId: number, parentControlPointId: number) {
		const controlPoint = this.getControlPoint(controlPointId);

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

	getWorldQuaternion(q = quat.create()) {
		quat.copy(q, this._quaternion);
		return q;
	}

	getBoundingBox(boundingBox = new BoundingBox()) {
		boundingBox.reset();
		return boundingBox;
	}

	set autoKill(autoKill) {
		this.#autoKill = autoKill;
	}

	get autoKill() {
		return this.#autoKill;
	}

	setLooping(looping: boolean) {
		this.#looping = looping;
	}

	getLooping() {
		return this.#looping;
	}

	dispose() {
		super.dispose();
		this.#controlPoints.forEach(element => element.dispose());
		this.#controlPoints.length = 0;
		this.material?.removeUser(this);

		for (const [_, renderer] of this.#renderers) {
			renderer.dispose();
		}

		for (const child of this.#childrenSystems) {
			child.dispose();
		}
	}

	getBounds(min = vec3.create(), max = vec3.create()) {
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

	static setSpeed(speed: number) {
		Source1ParticleSystem.#speed = speed;
	}

	static setSimulationSteps(simulationSteps: number) {
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

	buildContextMenu() {
		const startStop = this.isRunning ? { i18n: '#stop', f: () => this.stop() } : { i18n: '#start', f: () => this.start() };

		return Object.assign(super.buildContextMenu(), {
			SourceEngineParticleSystem_1: null,
			startStop: startStop,
			reset: { i18n: '#reset', f: () => this.reset() },
		});
	}

	toJSON() {
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

	static async constructFromJSON(json: any/*TODO: better type*/, entities: Map<string, Entity>, loadedPromise: Promise<void>) {
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

	static getEntityName() {
		return 'Source1ParticleSystem';
	}
}
Source1ParticleSystem.prototype.isParticleSystem = true;
registerEntity(Source1ParticleSystem);
Source1ParticleControler.setParticleConstructor(Source1ParticleSystem);
