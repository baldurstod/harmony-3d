import { vec3 } from 'gl-matrix';
import { Material } from '../../../../materials/material';
import { generateRandomUUID } from '../../../../math/functions';
import { Mesh } from '../../../../objects/mesh';
import { PARTICLE_ORIENTATION_SCREEN_ALIGNED, PARTICLE_ORIENTATION_SCREEN_Z_ALIGNED, PARTICLE_ORIENTATION_WORLD_Z_ALIGNED } from '../../../common/particles/particleconsts';
import { PARAM_TYPE_ID, PARAM_TYPE_STRING } from '../constants';
import { SourceEngineParticle } from '../particle';
import { ParamType, SourceEngineParticleSystem } from '../sourceengineparticlesystem';

export class SourceEngineParticleOperator {//TODOv3: rename this class ?
	#parameters = {};
	particleSystem: SourceEngineParticleSystem;
	material: Material;
	materialLoaded = false;
	paramList: ParamType[] = [];
	endCapState = -1;
	mesh: Mesh;//for renderers
	constructor() {
		this.setNameId(this.functionName);
	}

	get functionName() {
		return (this.constructor as typeof SourceEngineParticleOperator).getFunctionName();
	}

	static get functionName() {
		return 'Operator';
	}

	static getFunctionName() {
		return this.functionName;
	}

	initializeParticle(particle, elapsedTime) {
		if (!particle) {
			return;
		}
		this.doInit(particle, elapsedTime);
	}

	operateParticle(particle, elapsedTime) {
		if (this.endCapState != 1) {
			this.doOperate(particle, elapsedTime);
		}
	}

	forceParticle(particle, elapsedTime, accumulatedForces?) {
		if (!particle) {
			return;
		}
		this.doForce(particle, elapsedTime, accumulatedForces);
	}

	constraintParticle(particle) {
		if (!particle) {
			return;
		}
		this.applyConstraint(particle);
	}

	doEmit(elapsedTime: number) { }

	doInit(particle: SourceEngineParticle, elapsedTime: number) { }

	doOperate(particle: SourceEngineParticle, elapsedTime: number) { }

	doForce(particle: SourceEngineParticle, elapsedTime: number, accumulatedForces, strength?: number) { }

	applyConstraint(particle: SourceEngineParticle) { }

	doRender(particle: SourceEngineParticle[], elapsedTime: number, material: Material) { }

	initRenderer(particleSystem: SourceEngineParticleSystem) { }

	updateParticles(particleSystem, particleList, elapsedTime) { }

	emitParticle(creationTime, elapsedTime) {
		if (!this.particleSystem) {
			return;
		}
		return this.particleSystem.createParticle(creationTime, elapsedTime);
	}

	renderParticle(particleList, elapsedTime, material) {
		if (!particleList) {
			return;
		}
		this.doRender(particleList, elapsedTime, material);
	}

	setMaterial(material) {
		this.material = material;
	}

	setParticleSystem(particleSystem) {
		this.particleSystem = particleSystem;
	}

	paramChanged(name, value) {
		// Override this function is you need a notification when a parm is modified
	}

	setParameter(parameter, type, value) {
		if (parameter == '' || parameter == undefined) {
			return this;
		}
		if (parameter == 'operator end cap state') {
			this.endCapState = value;
		}
		if (this.#parameters[parameter] == undefined) {
			this.#parameters[parameter] = {};
		}
		this.#parameters[parameter].type = type;
		this.#parameters[parameter].value = value;
		//this.propertyChanged(parameter);
		this.paramChanged(parameter, value);
		return this;
	}

	getParameter(parameter) {
		const p = this.#parameters[parameter];
		if (p == undefined) {
			return null;
		}

		return p.value;
	}

	getParameters() {
		return this.#parameters;
	}

	setParameters(parameters) {
		for (const i in parameters) {
			const pair = parameters[i];
			this.setParameter(pair[0], pair[1], pair[2]);
		}
		return this;
	}

	setNameId(name) {
		//this.functionName = name;
		this.addParam('id', PARAM_TYPE_ID, generateRandomUUID());//TODO
		this.addParam('name', PARAM_TYPE_STRING, name);
		this.addParam('functionName', PARAM_TYPE_STRING, name);
	}

	doNothing() {
	}

	reset() {
	}

	getOperatorFade() {
		return this.getOperatorStrength();
	}

	getOperatorStrength() {
		if (!this.particleSystem) {
			return 0;
		}

		let start_fadein = this.getParameter('operator start fadein') ?? 0;
		let end_fadein = this.getParameter('operator end fadein') ?? 0;
		let start_fadeout = this.getParameter('operator start fadeout') ?? 0;
		let end_fadeout = this.getParameter('operator end fadeout') ?? 0;
		const fade_oscillate = this.getParameter('operator fade oscillate') ?? 0;
		let currentTime = this.particleSystem.currentTime;

		if (fade_oscillate > 0) {
			currentTime = (currentTime / fade_oscillate) % 1.;
		}

		if (start_fadein > currentTime) {
			return 0;
		}

		if (end_fadeout > 0 && end_fadeout < currentTime) {
			return 0;
		}

		let flStrength = 1.0;
		if (end_fadein > currentTime && end_fadein > start_fadein) {
			flStrength = Math.min(flStrength, (currentTime - start_fadein) / (end_fadein - start_fadein));
		}

		if ((currentTime > start_fadeout) &&
			(end_fadeout > start_fadeout)) {
			flStrength = Math.min(flStrength, (currentTime - end_fadeout) / (start_fadeout - end_fadeout));
		}

		return flStrength;


		if (start_fadein == 0 && end_fadein == 0 && start_fadeout == 0 && end_fadeout == 0) {
			// if all parms at 0, return 1
			return 1;
		}

		//	console.log(currentTime);
		if (fade_oscillate != 0) {
			currentTime = currentTime % fade_oscillate;
			start_fadein *= fade_oscillate;
			end_fadein *= fade_oscillate;
			start_fadeout *= fade_oscillate;
			end_fadeout *= fade_oscillate;
		}

		//	console.log(currentTime%fade_oscillate);

		switch (true) {
			case currentTime < start_fadein:
				return 0;
			case currentTime < end_fadein:
				return (currentTime - start_fadein) / (end_fadein - start_fadein);
			case currentTime < start_fadeout:
				return 1;
			case currentTime < end_fadeout:
				return 1 - (currentTime - start_fadeout) / (end_fadeout - start_fadeout);
			default:
				return 0;
		}

		return 0;
		/*
		float FadeInOut( float flFadeInStart, float flFadeInEnd, float flFadeOutStart, float flFadeOutEnd, float flCurTime )
		{
			if ( flFadeInStart > flCurTime )						// started yet?
				return 0.0;

			if ( ( flFadeOutEnd > 0. ) && ( flFadeOutEnd < flCurTime ) ) // timed out?
				return 0.;

			// handle out of order cases
			flFadeInEnd = max( flFadeInEnd, flFadeInStart );
			flFadeOutStart = max( flFadeOutStart, flFadeInEnd );
			flFadeOutEnd = max( flFadeOutEnd, flFadeOutStart );

			float flStrength = 1.0;
			if (
				( flFadeInEnd > flCurTime ) &&
				( flFadeInEnd > flFadeInStart ) )
				flStrength = min( flStrength, FLerp( 0, 1, flFadeInStart, flFadeInEnd, flCurTime ) );

			if ( ( flCurTime > flFadeOutStart) &&
				 ( flFadeOutEnd > flFadeOutStart) )
				flStrength = min ( flStrength, FLerp( 0, 1, flFadeOutEnd, flFadeOutStart, flCurTime ) );

			return flStrength;

		}
		*/
	}

	getParamList() {
		return this.paramList;
	}

	addParam(param, type, value) {
		this.paramList.push(new ParamType(param, type));

		this.setParameter(param, type, value);
	}
	/*
		toString() {
			const s = '';
			s = '"DmeParticleOperator"\n{\n';

			for (let i in this.#parameters) {
				const parameter = this.#parameters[i];
				if (parameter) {
					if (parameter.type == 'string') {
						s += '"' + i + '" "' + parameter.type + '" "' + escapeValue(parameter.value) + '"\n'
					} else {
						s += '"' + i + '" "' + parameter.type + '" "' + parameter.value + '"\n'
					}
				} else {
					if (ERROR) { console.error('parameter is null'); }
				}
			}
			s += '}';
			return s;
		}
	*/

	getInputValue(inputField, particle) {
		let input: any = 0;
		switch (inputField) {
			case 0: //creation time
				input = vec3.clone(particle.position);
				break;
			case 8: //creation time
				input = particle.cTime;
				break;
		}
		return input;
	}

	getInputValueAsVector(inputField, particle, v) {
		let input;
		switch (inputField) {
			case 0: //creation time
				vec3.copy(v, particle.position);
				break;
			case 4:
				v[0] = particle.rotationRoll;
				v[1] = particle.rotationRoll;
				v[2] = particle.rotationRoll;
				break;
			case 8: //creation time
				v[0] = particle.cTime;
				v[1] = particle.cTime;
				v[2] = particle.cTime;
				break;
		}
	}

	setOutputValue(outputField, value, particle) {
		particle.setInitialField(outputField, value /*TODO*/);
	}

	initMultipleOverride() {
		return false;
	}

	finished() {
		return false;
	}

	setOrientationType(orientationType) {
		switch (orientationType) {
			case 0:
				this.mesh.setDefine('PARTICLE_ORIENTATION', PARTICLE_ORIENTATION_SCREEN_ALIGNED);
				break;
			case 1:
				this.mesh.setDefine('PARTICLE_ORIENTATION', PARTICLE_ORIENTATION_SCREEN_Z_ALIGNED);
				break;
			case 2:
				this.mesh.setDefine('USE_PARTICLE_YAW', 0);
				this.mesh.setDefine('PARTICLE_ORIENTATION', PARTICLE_ORIENTATION_WORLD_Z_ALIGNED);
				break;
			case 3:
				this.mesh.setDefine('PARTICLE_ORIENTATION', PARTICLE_ORIENTATION_WORLD_Z_ALIGNED);
				break;
			default:
				console.error('Unknonw orientationType ', orientationType);
		}
	}

	dispose() {
	}
}
