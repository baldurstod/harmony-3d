import { quat, vec3 } from 'gl-matrix';

import { Source1ParticleControler } from './source1particlecontroler';
import { Entity } from '../../../entities/entity';
import { PARAM_TYPE_INT, PARAM_TYPE_STRING, PARAM_TYPE_COLOR, PARAM_TYPE_FLOAT, PARAM_TYPE_ID } from './constants';
import { SourceEngineParticle } from './particle';
import { Color, WHITE } from './color';
import { DEFAULT_MAX_PARTICLES, HARD_MAX_PARTICLES } from '../../common/particles/particleconsts';
import { ControlPoint } from '../../common/particles/controlpoint';
import { ERROR, WARN, LOG } from '../../../buildoptions';
import { JSONLoader } from '../../../importers/jsonloader';
import { SourceEngineMaterialManager } from '../materials/sourceenginematerialmanager';
import { BoundingBox } from '../../../math/boundingbox';
import { MAX_FLOATS } from '../../common/particles/randomfloats';
import { SourcePCF } from '../loaders/sourcepcf';
import { Material } from '../../../materials/material';
import { registerEntity } from '../../../entities/entities';
import { SourceEngineMaterial } from '../materials/sourceenginematerial';

export const MAX_PARTICLE_CONTROL_POINTS = 64;
const RESET_DELAY = 0;
let systemNumber = 0;

export class ParamType {
	param;
	type;
	constructor(param, type) {
		this.param = param;
		this.type = type;
	}
}

export class SourceEngineParticleSystem extends Entity {
	isParticleSystem = true;
	repository: string;
	#autoKill;
	#sequenceNumber = 0;
	#materialPromiseResolve;
	#materialPromise;
	#renderers = new Map();
	#particleCount = 0;
	#randomSeed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
	#maximumTimeStep = 0.1;
	animable = true;
	resetable = true;
	paramList = [];
	parameters = {};
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
	attachementBone = null;

	// List of living particles
	livingParticles = new Array();
	// List of dead but reusable particles
	poolParticles = new Array();

	currentOrientation = quat.create();
	prevOrientation = quat.create();

	emitters = {};//new Array();//todo transform to map
	initializers = {};// = new Array();//todo transform to map
	operators = {};//new Array();//todo transform to map
	forces = new Map();//new Array();//todo transform to map
	constraints = {};//new Array();//todo transform to map
	controlPoints: Array<ControlPoint> = [];

	childrenSystems = new Array();//todo transform to map
	tempChildren = {};//new Array();//todo transform to map
	operatorRandomSampleOffset = 0;
	parentSystem = undefined;
	firstStep: boolean = false;
	pcf: SourcePCF;
	material: SourceEngineMaterial;
	materialName: string;
	maxParticles: number;
	resetDelay: number;
	snapshot;
	attachementProp;
	attachementName;

	static #speed = 1.0;
	static #simulationSteps = 1;
	//constructor(repository, parameters, id) {
	constructor(params?: any) {
		params.name = params.name ?? `System ${systemNumber++}`;
		super(params);
		this.#autoKill = false;
		this.repository = params.repository;
		this.addParam('max_particles', PARAM_TYPE_INT, 50);
		this.addParam('initial_particles', PARAM_TYPE_INT, 0);
		this.addParam('material', PARAM_TYPE_STRING, '');
		this.addParam('snapshot', PARAM_TYPE_STRING, '');
		this.addParam('color', PARAM_TYPE_COLOR, new Color(255, 255, 255, 255));
		this.addParam('radius', PARAM_TYPE_FLOAT, 1);
		this.addParam('name', PARAM_TYPE_STRING, params.name);
		this.addParam('id', PARAM_TYPE_ID, params.id);

		this.addParam('minimum sim tick rate', PARAM_TYPE_FLOAT, 0);
		this.addParam('maximum sim tick rate', PARAM_TYPE_FLOAT, 1);
		this.addParam('maximum time step', PARAM_TYPE_FLOAT, 0.1);

		//this.maxParticles = null;
		this.setMaxParticles(DEFAULT_MAX_PARTICLES);
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
		for (let i = 0; i < this.childrenSystems.length; ++i) {
			this.childrenSystems[i].start();
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
		for (let i = 0; i < this.childrenSystems.length; ++i) {
			this.childrenSystems[i].stop();
		}
	}

	do(action, params) {
		switch (action) {
			case 'reset':
				this.reset();
				break;
		}
	}

	reset() {
		if (LOG) { console.log('Reset PS'); }
		this.stop();
		this.start();
		//this.resetChilds();
		//this.resetEmitters();
		//this.emitInitialParticles();
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
		for (let i = 0; i < this.childrenSystems.length; ++i) {
			this.childrenSystems[i].#reset();
		}
	}

	#resetEmitters() {
		for (let i in this.emitters) {//TODOv3
			const emitter = this.emitters[i];
			emitter.reset();
		}
	}

	#resetInitializers() {
		for (let i in this.initializers) {
			this.initializers[i].reset();
		}
	}

	updateChilds() {
		for (let i in this.tempChildren) {
			const ps = this.pcf.getSystem(this.tempChildren[i]);

			if (ps) {
				this.addChildSystem(ps);
				delete this.tempChildren[i];
			} else {
				if (ERROR) { console.error('System not found: ' + i); }
			}
		}
	}

	step(elapsedTime) {
		if (!this.isPlaying()) {
			elapsedTime = 0.0000001;
		}
		for (let i = 0; i < SourceEngineParticleSystem.#simulationSteps; i++) {
			this.#step(elapsedTime / SourceEngineParticleSystem.#simulationSteps);
		}
	}

	#step(elapsedTime) {
		if (!this.isRunning || SourceEngineParticleSystem.#speed == 0) {
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

		this.elapsedTime = elapsedTime * this.speed * SourceEngineParticleSystem.#speed;
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

	#emitInitialParticles(elapsedTime) {
		for (let i = 0; i < this.initialParticles; ++i) {
			this.createParticle(0, elapsedTime);
		}
	}

	#stepEmitters() {
		for (let i in this.emitters) {
			const emitter = this.emitters[i];
			emitter.doEmit(this.elapsedTime);
		}
	}
	/**
	 * Step operators for each particle, killing it if necessary.
	 */
	#stepOperators() {
		for (let i = 0; i < this.livingParticles.length; ++i) {
			const particle = this.livingParticles[i];
			particle.step(this.elapsedTime);
			this.operatorRandomSampleOffset = 0;
			for (let j in this.operators) {
				const operator = this.operators[j];
				operator.operateParticle(particle, this.elapsedTime);

				// break the loop if the particle is dead
				if (!particle.isAlive) break;

				this.operatorRandomSampleOffset += 17;
			}
			//particle.step(this.elapsedTime);

			if (!particle.isAlive) {
				this.poolParticles.push(particle);
				this.livingParticles.splice(i, 1);
				--i;
			}
		}

		if (this.livingParticles.length == 0) {
			for (let j in this.operators) {
				const operator = this.operators[j];
				switch (operator.functionName) {
					case 'set control point positions':
						operator.operateParticle(null, this.elapsedTime);
						break;
				}
			}
			this.#checkAutoKill();
		}
	}

	#checkAutoKill() {
		if (this.#autoKill) {
			if (this.#canKill()) {
				this.stop();
				this.remove();
			}
		}
	}

	#canKill() {
		if (Object.keys(this.tempChildren).length) {
			return false;
		}

		for (let i in this.emitters) {
			const emitter = this.emitters[i];
			if (!emitter.finished()) {
				return false;
			}
		}
		for (let child of this.childrenSystems) {
			if ((child.livingParticles.length > 0) || !child.#canKill()) {
				return false;
			}
		}
		return true;
	}

	#stepOperators1() {
		if (this.livingParticles.length == 0) {
			for (let j in this.operators) {
				const operator = this.operators[j];
				switch (operator.functionName) {
					case 'set control point positions':
						operator.operateParticle(null, this.elapsedTime);
						break;
				}
			}
		}
	}

	/**
	 * Step forces for each particle.
	 */
	stepForces() {
		for (let i = 0; i < this.livingParticles.length; ++i) {
			const particle = this.livingParticles[i];
			for (let force of this.forces.values()) {
				//const force = this.forces[j];
				force.forceParticle(particle, this.elapsedTime);
			}
		}
	}

	stepConstraints(particle) {
		//TODOv3: multiple passes
		for (let j in this.constraints) {
			const constraint = this.constraints[j];
			constraint.constraintParticle(particle);
		}
	}

	#stepRenderers(elapsedTime) {
		for (const [_, renderer] of this.#renderers) {
			renderer.updateParticles(this, this.livingParticles, elapsedTime);
		}
	}

	#stepChildren(elapsedTime) {
		for (let j in this.childrenSystems) {//TODOv3
			const child = this.childrenSystems[j];
			child.#step(elapsedTime);
		}
	}

	createParticle(creationTime, elapsedTime) {//TODOv3
		if (this.livingParticles.length < this.maxParticles) {
			// first try to get one from the pool
			if (this.poolParticles.length > 0) {
				const particle = this.poolParticles.pop();
				//init the particle to its initial state;
				particle.reset();
				particle.cTime = creationTime;
				this.#initControlPoint(particle);
				this.#startParticle(particle, elapsedTime);
				return particle;
			}

			const particle = new SourceEngineParticle(/*'Particle ' + */(this.#randomSeed + this.#particleCount++) % MAX_FLOATS, this);
			particle.cTime = creationTime;
			this.#initControlPoint(particle);
			this.#startParticle(particle, elapsedTime);
			++this.currentParticles;
			return particle;
		}

		//console.error('No particle has been emitted. Try to raise max particles');
		return null;
	}

	#startParticle(particle, elapsedTime) {
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

	#preInitParticle(particle) {
		const radius = this.getParameter('radius') || 1;
		const color = this.getParameter('color') || WHITE;

		particle.setInitialRadius(radius);
		particle.setInitialSequence(this.#sequenceNumber);
		particle.color.setColorAlpha(color);//TODO: remove alpha
		particle.startAlpha = color.a;
		particle.alpha = color.a;
		//particle.creationTime = this.currentTime;
	}

	#initControlPoint(particle) {
		this.getWorldPosition(particle.cpPosition);
	}

	getWorldPosition(vec = vec3.create()) {
		return vec3.zero(vec);
	}

	stepControlPoint() {
		for (let i = 0; i < this.controlPoints.length; i++) {
			const cp = this.controlPoints[i];
			if (!cp) {
				continue;
			}
			cp.step();
			if (i == 0) {
				if (cp.attachementProp) {
					const atta = cp.attachementProp//.getAttachement(cp.attachementName);
					if (atta) {
						this.setOrientation(atta.getWorldQuat());
					}
				}
			}
		}
		if (this.parentSystem) {
			this.setOrientation(this.parentSystem.getWorldQuaternion());

		}
	}
	setParam(element) {
		if (!element) { return null; }

		const parameter = element.typeName;
		const type = element.type;
		const value = element.value;

		return this.setParameter(parameter, type, value);
	}

	addParam(param, type, value) {
		this.paramList.push(new ParamType(param, type));
		this.setParameter(param, type, value);
	}

	setParameter(parameter, type, value) {
		if (parameter == '') return;
		if (this.parameters[parameter] === undefined) {
			this.parameters[parameter] = {};
		}
		this.parameters[parameter].type = type;
		this.parameters[parameter].value = value;
		this.propertyChanged(parameter);
		return this;
	}

	propertyChanged(name) {
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


	getParameter(parameterName) {
		const parameter = this.parameters[parameterName];
		if (parameter === undefined) {
			return null;
		}

		return parameter.value;
	}

	setMaxParticles(max) {
		this.maxParticles = Math.max(Math.min(max, HARD_MAX_PARTICLES), 1);
	}
	setRadius(radius) {
		this.radius = radius;
	}
	setInitialParticles(initial) {
		this.initialParticles = initial;
	}
	setMinimumTickRate(minimum) {
		this.minimumTickRate = minimum;
	}
	setMaximumTickRate(maximum) {
		this.maximumTickRate = maximum;
	}
	setMaterialName(materialName) {
		if (!materialName || materialName === '') {
			return;
		}
		this.materialName = materialName;

		SourceEngineMaterialManager.getMaterial(this.repository, materialName).then(
			(material) => {
				this.material = material;
				material.addUser(this);
				if (this.#materialPromiseResolve) {
					this.#materialPromiseResolve(material);
				}
			}
		);
	}

	#getMaterial() {
		this.#materialPromise = this.#materialPromise ?? new Promise((resolve, reject) => {
			this.#materialPromiseResolve = resolve
		});
		return this.#materialPromise;
	}

	setSnapshot(snapshot) {
		if (!snapshot || snapshot === '') {
			return;
		}
		if (snapshot !== this.snapshot) {
			this.snapshot = snapshot;
			//this.loadSnapshot();//TODOv3
		}
	}

	addSub(type, object, id) {
		switch (type) {
			case 'operator':
			case 'operators':
				this.addOperator(object, id);
				break;
			case 'force':
			case 'forces':
				this.addForce(object, id);
				break;
			case 'constraint':
			case 'constraints':
				this.addConstraint(object, id);
				break;
			case 'emitter':
			case 'emitters':
				this.addEmitter(object, id);
				break;
			case 'initializer':
			case 'initializers':
				this.addInitializer(object, id);
				break;
			case 'renderer':
			case 'renderers':
				this.addRenderer(object, id);
				break;
			case 'controlpoint':
				this.addControlPoint(object, id);
				break;
			default:
				if (WARN) { console.warn('Unknown sub type ' + type); }
				break;
		}
	}


	addEmitter(emitter, id) {
		this.emitters[id] = emitter;
		emitter.setParticleSystem(this);
	}

	addInitializer(initializer, id) {
		this.initializers[id] = initializer;
		initializer.setParticleSystem(this);
	}

	addOperator(operator, id) {
		this.operators[id] = operator;
		operator.setParticleSystem(this);
	}

	removeOperator(id) {//TODOv3 improve
		delete this.emitters[id];
		delete this.initializers[id];
		delete this.operators[id];
		this.forces.delete(id);
		delete this.constraints[id];
		this.#renderers.delete(id);
		delete this.childrenSystems[id];
		this.removeChild(id);
	}


	addForce(force, id) {
		this.forces.set(id, force);
		force.setParticleSystem(this);
	}

	addConstraint(constraint, id) {
		this.constraints[id] = constraint;
		constraint.setParticleSystem(this);
	}

	addRenderer(renderer, id) {
		this.#renderers.set(id, renderer);
		renderer.setParticleSystem(this);

		this.#getMaterial().then((material) => renderer.initRenderer(this));
	}

	addControlPoint(controlPoint, id) {
		//	this.controlPoints.push(controlPoint);
		this.controlPoints[id] = controlPoint;
		if (id == 0) {
			return;
		}

		let firstCP = this.getControlPoint(0);
		if (firstCP) {
			controlPoint.setParent(firstCP);
		}
	}

	getControlPoint(controlPointId) {
		if (controlPointId < 0 || controlPointId >= MAX_PARTICLE_CONTROL_POINTS) {
			return null;
		}
		let parentSystem = this.parentSystem;
		if (parentSystem !== undefined) {
			return this.controlPoints[controlPointId] ?? parentSystem.getControlPoint(controlPointId);
		}

		let controlPoint = this.controlPoints[controlPointId];
		if (controlPoint === undefined) {
			controlPoint = this.#createControlPoint(controlPointId);
		}
		return controlPoint;
	}

	getOwnControlPoint(controlPointId) {
		return this.controlPoints[controlPointId] ?? this.#createControlPoint(controlPointId);
	}

	#createControlPoint(controlPointId) {
		let controlPoint = new ControlPoint();
		controlPoint.name = controlPointId;
		if (controlPointId == 0) {
			this.addChild(controlPoint);
		} else {
			//Attach to first control point
			//this.getControlPoint(0).addChild(controlPoint);
			this.addChild(controlPoint);
		}
		this.controlPoints[controlPointId] = controlPoint;

		vec3.set(controlPoint.fVector, 0, 1, 0);
		vec3.set(controlPoint.uVector, 0, 0, 1);
		vec3.set(controlPoint.rVector, 1, 0, 0);

		let parentSystem = this.parentSystem;
		if (parentSystem !== undefined) {
			let parentControlPoint = parentSystem.getControlPoint(controlPointId);
			if (parentControlPoint) {
				controlPoint.parentControlPoint = parentControlPoint;
			}
		}

		return controlPoint;
	}

	addTempChild(name, id) {
		this.tempChildren[id] = name;
	}
	addChildSystem(particleSystem) {
		this.childrenSystems.push(particleSystem);
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
	setParent(parentSystem) {
		return this.parentSystem = parentSystem;
	}


	/**
	 * Orient all particles relative to control point #0.
	 */
	setCpOrientation() {
		return;//TODOV3
		const cp = this.getControlPoint(0);
		if (cp) {
			const orientation = cp.getWorldQuaternion();
			for (let i = 0; i < this.livingParticles.length; ++i) {
				const particle = this.livingParticles[i];
				quat.copy(particle.cpOrientation, orientation);
				quat.copy(particle.cpOrientation, this.getWorldQuaternion());
			}
		}
	}
	/**
	 * Set control point orientation
	 * @param (Object quat) orientation New orientation
	 */
	setOrientation(orientation) {
		quat.copy(this.prevOrientation, this.currentOrientation);
		quat.copy(this.currentOrientation, orientation);
	}

	setChildControlPointPosition(first, last, position) {
		for (let i = 0; i < this.childrenSystems.length; ++i) {
			const child = this.childrenSystems[i];

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

	getParticle(index) {
		if (index == undefined) {
			index = Math.floor(Math.random() * this.livingParticles.length);
		}

		/*if (index >= this.livingParticles.length) {
			index = Math.floor(Math.random() * this.poolParticles.length);
			return this.poolParticles[index];
		}*/

		return this.livingParticles[index];
	}


	getControlPointPosition(cpId) {
		const cp = this.getControlPoint(cpId);
		if (cp) {
			return cp.getWorldPosition();
		}
		return vec3.create();
	}

	setControlPointPosition(cpId, position) {
		const cp = this.getOwnControlPoint(cpId);
		if (cp) {
			cp.position = position;
		}
	}

	setControlPointParent(controlPointId, parentControlPointId) {
		const controlPoint = this.getControlPoint(controlPointId);

		let parentSystem = this.parentSystem;
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

	setAttachementBone_removeme(attachementProp, attachementName, cpIndex, offset) {
		cpIndex = cpIndex || 0;
		this.attachementProp = attachementProp;
		this.attachementName = attachementName;

		// Set the attachement to the first control point
		const cp = this.getControlPoint(cpIndex);
		if (cp) {
			cp.setAttachement(attachementProp, attachementName, offset);
		}

		if (this.isRunning) {
			this.reset();
		}
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

	dispose() {
		super.dispose();
		this.controlPoints.forEach(element => element.dispose());
		this.controlPoints.length = 0;
		this.material?.removeUser(this);

		for (const [_, renderer] of this.#renderers) {
			renderer.dispose();
		}

		for (const child of this.childrenSystems) {
			child.dispose();
		}
	}

	getBounds(min = vec3.create(), max = vec3.create()) {
		if (!this.livingParticles.length) {
			vec3.set(min, -1, -1, -1);
			vec3.set(max, 1, 1, 1);
		} else {
			vec3.set(min, Infinity, Infinity, Infinity);
			vec3.set(max, -Infinity, -Infinity, -Infinity);
			for (let particle of this.livingParticles) {
				vec3.min(min, min, particle.position);
				vec3.max(max, max, particle.position);
			}
		}
	}

	static setSpeed(speed) {
		SourceEngineParticleSystem.#speed = speed;
	}

	static setSimulationSteps(simulationSteps) {
		simulationSteps = Math.round(simulationSteps);
		if (simulationSteps > 0 && simulationSteps <= 10) {
			SourceEngineParticleSystem.#simulationSteps = simulationSteps;
		}
	}

	buildContextMenu() {
		let startStop = this.isRunning ? { i18n: '#stop', f: () => this.stop() } : { i18n: '#start', f: () => this.start() };

		return Object.assign(super.buildContextMenu(), {
			SourceEngineParticleSystem_1: null,
			startStop: startStop,
			reset: { i18n: '#reset', f: () => this.reset() },
		});
	}

	toJSON() {
		let json = super.toJSON();
		json.repository = this.repository;
		if (!this.isRunning) {
			json.isrunning = false;
		}

		let jControlPoint = [];
		this.controlPoints.forEach((element, index) => jControlPoint[index] = element.id);
		json.controlpoints = jControlPoint;
		return json;
	}

	static async constructFromJSON(json, entities, loadedPromise) {
		let entity = await Source1ParticleControler.createSystem(json.repository, json.name);
		if (entity) {
			loadedPromise.then(() => {
				console.error(entities);

				let jControlPoint = json.controlpoints;
				if (jControlPoint) {
					for (let i = 0; i < jControlPoint.length; ++i) {
						let cpEntity = entities.get(jControlPoint[i]);
						if (cpEntity) {
							entity.controlPoints[i] = cpEntity;
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

	get entityName() {
		return 'Source1ParticleSystem';
	}

	static get entityName() {
		return 'Source1ParticleSystem';
	}
}
SourceEngineParticleSystem.prototype.isParticleSystem = true;
registerEntity(SourceEngineParticleSystem);
Source1ParticleControler.setParticleConstructor(SourceEngineParticleSystem);