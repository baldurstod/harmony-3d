import { vec3, vec4 } from 'gl-matrix';
import { TESTING } from '../../../../buildoptions';
import { clamp, lerp, RandomFloat, RemapValClamped, RemapValClampedBias, vec3RandomBox } from '../../../../math/functions';
import { Mesh } from '../../../../objects/mesh';
import { JSONObject } from '../../../../types';
import { Kv3Array } from '../../../common/keyvalue/kv3array';
import { PARTICLE_ORIENTATION_ALIGN_TO_PARTICLE_NORMAL, PARTICLE_ORIENTATION_FULL_3AXIS_ROTATION, PARTICLE_ORIENTATION_SCREEN_ALIGNED, PARTICLE_ORIENTATION_SCREEN_Z_ALIGNED, PARTICLE_ORIENTATION_SCREENALIGN_TO_PARTICLE_NORMAL, PARTICLE_ORIENTATION_WORLD_Z_ALIGNED } from '../../../common/particles/particleconsts';
import { Source2Material } from '../../materials/source2material';
import { Source2SpriteCard } from '../../materials/source2spritecard';
import { Source2Particle } from '../source2particle';
import { Source2ParticleSystem } from '../source2particlesystem';

export const COLOR_SCALE = 1 / 255;

function vec4Scale(out: vec4, a: vec4, b: number) {
	out[0] = Number(a[0]) * b;
	out[1] = Number(a[1]) * b;
	out[2] = Number(a[2]) * b;
	out[3] = Number(a[3]) * b;
	return out;
}

function vec4Lerp(out: vec4, a: vec4, b: vec4, t: number) {
	const ax = Number(a[0]);
	const ay = Number(a[1]);
	const az = Number(a[2]);
	const aw = Number(a[3]);
	out[0] = ax + t * (Number(b[0]) - ax);
	out[1] = ay + t * (Number(b[1]) - ay);
	out[2] = az + t * (Number(b[2]) - az);
	out[3] = aw + t * (Number(b[3]) - aw);
	return out;
}

export type Source2OperatorParamValue = any;/*TODO: improve type */

export class Operator {//TODOv3: rename this class ?
	static PVEC_TYPE_PARTICLE_VECTOR = false;
	#parameters: Record<string, any> = {};
	system: Source2ParticleSystem
	opStartFadeInTime = 0;
	opEndFadeInTime = 0;
	opStartFadeOutTime = 0;
	opEndFadeOutTime = 0;
	opFadeOscillatePeriod = 0;
	normalizePerLiving = false;
	disableOperator = false;
	controlPointNumber = 0;
	fieldInput = -1;
	fieldOutput = -1;
	scaleCp?: number;
	mesh?: Mesh;
	endCapState?: number;
	currentTime = 0;
	operateAllParticlesRemoveme = false;

	constructor(system: Source2ParticleSystem) {
		this.system = system;
	}

	setParam(paramName: string, value: Source2OperatorParamValue) {
		if (value instanceof Kv3Array) {
			const arr = [];
			for (const v of value.values) {
				if (typeof v == 'bigint') {
					arr.push(Number(v));
				} else {
					arr.push(v);
				}
			}
			this.#parameters[paramName] = arr;
		} else {
			if (typeof value == 'bigint') {
				this.#parameters[paramName] = Number(value);
			} else {
				this.#parameters[paramName] = value;
			}
		}
		this._paramChanged(paramName, value);
	}

	getParam(paramName: string) {
		return this.#parameters[paramName];
	}

	getParamScalarValue(paramName: string, particle?: Source2Particle) {
		const parameter = this.#parameters[paramName];
		return this.#getParamScalarValue(parameter, particle);
	}

	#getParamScalarValue(parameter: JSONObject, particle?: Source2Particle) {
		if (parameter) {
			let inputValue;
			const type = parameter.m_nType;
			if (type) {
				switch (type) {
					case 'PF_TYPE_LITERAL':
						return parameter.m_flLiteralValue;
						break;
					case 'PF_TYPE_PARTICLE_AGE':
						return parameter.m_vLiteralValue;
						break;
					case 'PF_TYPE_PARTICLE_NUMBER_NORMALIZED':
						if (this.normalizePerLiving) {
							const max = this.system.livingParticles.length;
							inputValue = (particle?.id ?? 0) % max / max;
						} else {
							inputValue = (particle?.id ?? 0) / this.system.maxParticles;
						}
						return this.#getParamScalarValue2(parameter, inputValue);
						break;
					case 'PF_TYPE_PARTICLE_NUMBER':
						inputValue = particle?.id ?? 0;
						return this.#getParamScalarValue2(parameter, inputValue);
						break;
					case 'PF_TYPE_PARTICLE_AGE_NORMALIZED':
						return this.#getParamScalarValue2(parameter, particle?.proportionOfLife ?? 0);
						break;
					case 'PF_TYPE_RANDOM_BIASED':
						//TODO: use parameter.m_nBiasType
						return RemapValClampedBias(Math.random(), 0, 1, parameter.m_flRandomMin as number, parameter.m_flRandomMax as number, 0.5/*parameter.m_flBiasParameter*/);//TODO: use another bias function bias varies from -1 to 1
						break;
					case 'PF_TYPE_RANDOM_UNIFORM':
						return RandomFloat(parameter.m_flRandomMin as number, parameter.m_flRandomMax as number);
						break;
					case 'PF_TYPE_COLLECTION_AGE':
						return this.#getParamScalarValue2(parameter, this.system.currentTime);
						break;
					case 'PF_TYPE_PARTICLE_NOISE':
						return this.#getParamScalarValue2(parameter, RandomFloat(parameter.m_flNoiseOutputMin as number, parameter.m_flNoiseOutputMax as number));//TODO
						break;
					case 'PF_TYPE_CONTROL_POINT_COMPONENT':
						const cp = this.system.getControlPoint(parameter.m_nControlPoint as number);
						if (cp) {
							return cp.position[parameter.m_nVectorComponent as number];
						}
						return 0;
						break;
					case 'PF_TYPE_PARTICLE_FLOAT':
						return inputValue = RemapValClamped(
							particle?.getField(parameter.m_nScalarAttribute as number ?? 0) as number ?? 0,
							parameter.m_flInput0 as number ?? 0,
							parameter.m_flInput1 as number ?? 1,
							parameter.m_flOutput0 as number ?? 0,
							parameter.m_flOutput1 as number ?? 1
						);
					default:
						console.error('#getParamScalarValue unknown type', parameter);
						throw 'Code me'
				}
			} else {
				return parameter;
			}
		}
	}

	#getParamScalarValue2(parameter: any/*TODO: improve type*/, inputValue: number) {
		const mapType = parameter.m_nMapType;

		switch (mapType) {
			case 'PF_MAP_TYPE_DIRECT':
				return inputValue;
				break;
			case 'PF_MAP_TYPE_CURVE':
				return this.#getParamScalarValueCurve(parameter, inputValue);
				break;
			case 'PF_MAP_TYPE_MULT':
				return inputValue * parameter.m_flMultFactor;
				break;
			case 'PF_MAP_TYPE_REMAP':
				return inputValue;//TODO
				break;
			default:
				console.error('Unknown map type : ', mapType, parameter);
				return 0;
		}
	}

	#getParamScalarValueCurve(parameter: JSONObject/*TODO: improve type*/, inputValue: number) {
		const curve = parameter.m_Curve as any/*TODO: improve type*/;
		const inputMin = curve.m_vDomainMins[0];
		const inputMax = curve.m_vDomainMaxs[0];
		const outputMin = curve.m_vDomainMins[1];
		const outputMax = curve.m_vDomainMaxs[1];
		const inputMode = parameter.m_nInputMode;
		//let modeClamped = parameter.m_nInputMode == "PF_INPUT_MODE_CLAMPED" ? true : false;
		if (parameter.m_nInputMode == 'PF_INPUT_MODE_CLAMPED') {
			inputValue = clamp(inputValue, inputMin, inputMax);
		} else {
			//"PF_INPUT_MODE_LOOPED"
			//Note : the loop goes from 0 to inputMax, not inputMin to inputMax
			inputValue = inputMax !== 0 ? inputValue % inputMax : inputMin;

		}
		return this.#getCurveValue(curve, inputValue);
	}

	#getCurveValue(curve: any/*TODO: improve type*/, x: number) {
		//TODO: do a real curve
		const spline = curve.m_spline;
		let previousKey = spline[0];
		let key = previousKey;
		if (x < previousKey.x) {
			return previousKey.y;
		}

		let index = 0;
		while (key = spline[++index]) {
			if (x < key.x) {
				return lerp(previousKey.y, key.y, (x - previousKey.x) / (key.x - previousKey.x));
			}
			previousKey = key;
		}
		return previousKey.y;

		//export function lerp(min, max, v) {
	}


	getParamVectorValue(paramName: string, particle?: Source2Particle, outVec: vec4 = vec4.create()) {
		const parameter = this.#parameters[paramName];
		if (parameter) {
			const type = parameter.m_nType;
			if (type) {
				switch (type) {
					case 'PVEC_TYPE_LITERAL':
						return parameter.m_vLiteralValue;
						break;
					case 'PVEC_TYPE_PARTICLE_VECTOR':
						if (!Operator.PVEC_TYPE_PARTICLE_VECTOR) {
							Operator.PVEC_TYPE_PARTICLE_VECTOR = true;
							throw 'Code me';
						}
						break;
					case 'PVEC_TYPE_FLOAT_INTERP_GRADIENT':
						return this.#getParamVectorValueFloatInterpGradient(parameter, particle, outVec);
						break;
					case 'PVEC_TYPE_FLOAT_COMPONENTS':
						outVec[0] = this.#getParamScalarValue(parameter.m_FloatComponentX, particle);
						outVec[1] = this.#getParamScalarValue(parameter.m_FloatComponentY, particle);
						outVec[2] = this.#getParamScalarValue(parameter.m_FloatComponentZ, particle);
						break;
					case 'PVEC_TYPE_RANDOM_UNIFORM_OFFSET':
						vec3RandomBox(outVec as vec3, parameter.m_vRandomMin, parameter.m_vRandomMax);
						break;
					case 'PVEC_TYPE_CP_VALUE':
						const cp = this.system.getControlPoint(parameter.m_nControlPoint);
						if (cp) {
							vec3.copy(outVec as vec3, cp.currentWorldPosition);
							if (parameter.m_vCPValueScale) {
								vec3.mul(outVec as vec3, outVec as vec3, parameter.m_vCPValueScale);
							}
						}
						break;
					case 'PVEC_TYPE_RANDOM_UNIFORM':
						//TODO
						break;
					default:
						console.error('getParamVectorValue unknown type', parameter);
						throw 'Code me'
				}
			} else {
				return parameter;
			}
		}
	}

	#getParamVectorValueFloatInterpGradient(parameter: any/*TODO: improve type*/, particle: Source2Particle | undefined, outVec: vec4) {
		const interpInput0 = parameter.m_flInterpInput0;
		const interpInput1 = parameter.m_flInterpInput1;
		let inputValue = this.#getParamScalarValue(parameter.m_FloatInterp, particle);

		inputValue = RemapValClamped(inputValue, interpInput0, interpInput1, 0.0, 1.0);

		const stops = parameter.m_Gradient?.m_Stops;
		if (stops) {
			//m_Color
			let previousStop = stops[0];
			let stop = previousStop;
			if (inputValue < previousStop.m_flPosition) {
				return vec4Scale(outVec, previousStop.m_Color, COLOR_SCALE);
			}

			let index = 0;
			while (stop = stops[++index]) {
				if (inputValue < stop.m_flPosition) {
					vec4Lerp(outVec, previousStop.m_Color, stop.m_Color, (inputValue - previousStop.m_flPosition) / (stop.m_flPosition - previousStop.m_flPosition));
					return vec4.scale(outVec, outVec, COLOR_SCALE);
				}
				previousStop = stop;
			}
			return vec4Scale(outVec, previousStop.m_Color, COLOR_SCALE);
		}

	}

	_paramChanged(paramName: string, value: Source2OperatorParamValue) {
		switch (paramName) {
			case 'm_bDisableOperator':
				this.disableOperator = value;
				break;
			case 'm_nOpEndCapState':
				//TODO: do it properly
				if (value == 1 || value == 1n || value == 'PARTICLE_ENDCAP_ENDCAP_ON') {
					this.disableOperator = true;
				}
				break;
			case 'm_flOpStartFadeInTime':
				this.opStartFadeInTime = value;
				break;
			case 'm_flOpEndFadeInTime':
				this.opEndFadeInTime = value;
				break;
			case 'm_flOpStartFadeOutTime':
				this.opStartFadeOutTime = value;
				break;
			case 'm_flOpEndFadeOutTime':
				this.opEndFadeOutTime = value;
				break;
			case 'm_flOpFadeOscillatePeriod':
				this.opFadeOscillatePeriod = value;
				break;
			case 'm_nControlPointNumber':
				if (TESTING && this.controlPointNumber === undefined) {
					throw 'this.controlPointNumber must have a default value';
				}
				this.controlPointNumber = Number(value);
				break;
			case 'm_nOrientationType':
				this.setOrientationType(value);
				break;
			case 'm_nFieldInput':
				if (TESTING && this.fieldInput === undefined) {
					throw 'this.fieldInput must have a default value';
				}
				this.fieldInput = Number(value);
				break;
			case 'm_nFieldOutput':
				if (TESTING && this.fieldOutput === undefined) {
					throw 'this.fieldOutput must have a default value';
				}
				this.fieldOutput = Number(value);
				break;
			case 'm_nOpScaleCP':
				this.scaleCp = Number(value);
				break;
			case 'm_flOpStrength':
				//TODO
				break;
			case 'm_flAlphaScale':
				//handled in operator
				break;
				console.warn(this.constructor.name + ' : unknown parameter : ' + paramName, value);
		}
	}

	initializeParticle(particles: Source2Particle, elapsedTime: number) {
		if (!particles || this.disableOperator) {
			return;
		}
		let strength = 1;
		if (this.scaleCp) {
			strength = this.system.getControlPoint(this.scaleCp).currentWorldPosition[0];
		}
		this.doInit(particles, elapsedTime, strength);
	}

	operateParticle(particle: Source2Particle | null | Source2Particle[], elapsedTime: number) {
		if (this.disableOperator) {
			return;
		}
		if (this.endCapState != 1) {
			let strength = 1;
			if (this.scaleCp) {
				strength = this.system.getControlPoint(this.scaleCp).currentWorldPosition[0];
			}
			this.doOperate(particle, elapsedTime, strength);
		}
	}

	forceParticle(particle: Source2Particle, elapsedTime: number, accumulatedForces: vec3) {
		if (!particle || this.disableOperator) {
			return;
		}
		this.doForce(particle, elapsedTime, accumulatedForces);
	}

	constraintParticle(particle: Source2Particle) {
		if (!particle || this.disableOperator) {
			return;
		}
		this.applyConstraint(particle);
	}

	emitParticle(creationTime: number, elapsedTime: number) {
		if (!this.system || this.disableOperator) {
			return;
		}
		return this.system.createParticle(creationTime, elapsedTime);
	}

	renderParticle(particleList: Source2Particle, elapsedTime: number, material: Source2Material) {
		if (!particleList) {
			return;
		}
		this.doRender(particleList, elapsedTime, material);
	}

	checkIfOperatorShouldRun() {
		const strength = this.fadeInOut();
		return strength > 0;
	}

	fadeInOut() {
		if (this.currentTime < this.opStartFadeInTime) {
			return 0;
		}
		if (this.opEndFadeOutTime && this.currentTime > this.opEndFadeOutTime) {
			return 0;
		}
		if (this.currentTime < this.opEndFadeInTime) {
			return (this.currentTime - this.opStartFadeInTime) / (this.opEndFadeInTime - this.opStartFadeInTime);
		}
		if (this.currentTime < this.opStartFadeOutTime) {
			return 1;
		}
		if (this.currentTime < this.opEndFadeOutTime) {
			return (this.currentTime - this.opStartFadeOutTime) / (this.opEndFadeOutTime - this.opStartFadeOutTime);
		}
		return 1;
	}

	setParameter(parameter: string, type: any/*TODO: improve type*/, value: any) {
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
		return this;
	}

	getParameter(parameter: string) {
		const p = this.#parameters[parameter];
		if (p == undefined) {
			return null;
		}

		return p.value;
	}

	getParameters() {
		return this.#parameters;
	}

	setParameters(parameters: Record<string, any>) {
		for (const i in parameters) {
			const pair = parameters[i];
			this.setParameter(pair[0], pair[1], pair[2]);
		}
		return this;
	}

	doNothing() {
	}

	reset() {
	}

	getOperatorFade() {
		if (!this.system) {
			return 0;
		}

		let start_fadein = this.getParameter('operator start fadein') || 0;
		let end_fadein = this.getParameter('operator end fadein') || 0;
		let start_fadeout = this.getParameter('operator start fadeout') || 0;
		let end_fadeout = this.getParameter('operator end fadeout') || 0;
		const fade_oscillate = this.getParameter('operator fade oscillate') || 0;

		if (start_fadein == 0 && end_fadein == 0 && start_fadeout == 0 && end_fadeout == 0) {
			// if all parms at 0, return 1
			return 1;
		}

		let currentTime = this.system.currentTime;
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
	}

	getInputValue(inputField: number, particle: Source2Particle) {
		let input;
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

	getInputValueAsVector(inputField: number, particle: Source2Particle, v: vec4) {
		let input;
		switch (inputField) {
			case 0: //creation time
				vec3.copy(v as vec3, particle.position);
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

	setOutputValue(outputField: number, value: any, particle: Source2Particle) {
		particle.setInitialField(outputField, value /*TODO*/);
	}

	initMultipleOverride() {
		return false;
	}

	isPreEmission() {
		return false;
	}

	setOrientationType(orientationType: string | number | bigint) {
		//TODO: finish this
		switch (orientationType) {
			case 'PARTICLE_ORIENTATION_SCREEN_ALIGNED':
			case 0n:
			case 0:
				this.mesh?.setDefine('PARTICLE_ORIENTATION', PARTICLE_ORIENTATION_SCREEN_ALIGNED);
				break;
			case 'PARTICLE_ORIENTATION_SCREEN_Z_ALIGNED':
			case 1n:
			case 1:
				this.mesh?.setDefine('PARTICLE_ORIENTATION', PARTICLE_ORIENTATION_SCREEN_Z_ALIGNED);
				break;
			case 'PARTICLE_ORIENTATION_WORLD_Z_ALIGNED':
			case 2n:
			case 2:
				this.mesh?.setDefine('PARTICLE_ORIENTATION', PARTICLE_ORIENTATION_WORLD_Z_ALIGNED);
				break;
			case 'PARTICLE_ORIENTATION_ALIGN_TO_PARTICLE_NORMAL':
			case 3n:
			case 3:
				this.mesh?.setDefine('PARTICLE_ORIENTATION', PARTICLE_ORIENTATION_ALIGN_TO_PARTICLE_NORMAL);
				break;
			case 'PARTICLE_ORIENTATION_SCREENALIGN_TO_PARTICLE_NORMAL':
			case 4n:
			case 4:
				this.mesh?.setDefine('PARTICLE_ORIENTATION', PARTICLE_ORIENTATION_SCREENALIGN_TO_PARTICLE_NORMAL);
				break;
			case 'PARTICLE_ORIENTATION_FULL_3AXIS_ROTATION':
			case 5n:
			case 5:
				this.mesh?.setDefine('PARTICLE_ORIENTATION', PARTICLE_ORIENTATION_FULL_3AXIS_ROTATION);
				break;
			default:
				console.error('Unknonw orientationType ', orientationType);
		}
	}

	init() {
		//This function is called after parameters are set
	}

	dispose() {
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number) { }
	doEmit(elapsedTime: number) { }
	doOperate(particle: Source2Particle | null | Source2Particle[], elapsedTime: number, strength: number) { }
	doForce(particle: Source2Particle, elapsedTime: number, accumulatedForces: vec3, strength?: number) { }
	applyConstraint(particle: Source2Particle) { }
	doRender(particle: Source2Particle, elapsedTime: number, material: Source2Material) { }
	initRenderer(particleSystem: Source2ParticleSystem) { }
	updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number) { }
}
