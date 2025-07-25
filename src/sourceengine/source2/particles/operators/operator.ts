import { vec2, vec3, vec4 } from 'gl-matrix';
import { TESTING } from '../../../../buildoptions';
import { clamp, lerp, RandomFloat, RemapValClamped, RemapValClampedBias, vec3RandomBox } from '../../../../math/functions';
import { Mesh } from '../../../../objects/mesh';
import { PARTICLE_ORIENTATION_ALIGN_TO_PARTICLE_NORMAL, PARTICLE_ORIENTATION_FULL_3AXIS_ROTATION, PARTICLE_ORIENTATION_SCREEN_ALIGNED, PARTICLE_ORIENTATION_SCREEN_Z_ALIGNED, PARTICLE_ORIENTATION_SCREENALIGN_TO_PARTICLE_NORMAL, PARTICLE_ORIENTATION_WORLD_Z_ALIGNED } from '../../../common/particles/particleconsts';
import { Source2Material } from '../../materials/source2material';
import { Source2Particle } from '../source2particle';
import { Source2ParticleSystem } from '../source2particlesystem';
import { OperatorParam } from './operatorparam';

export const COLOR_SCALE = 1 / 255;

function vec4Scale(out: vec4, a: vec4, b: number) {
	out[0] = Number(a[0]) * b;
	out[1] = Number(a[1]) * b;
	out[2] = Number(a[2]) * b;
	out[3] = Number(a[3]) * b;
	return out;
}

function vec3Lerp(out: vec3, a: vec3, b: vec3, t: number) {
	const ax = Number(a[0]);
	const ay = Number(a[1]);
	const az = Number(a[2]);
	out[0] = ax + t * (Number(b[0]) - ax);
	out[1] = ay + t * (Number(b[1]) - ay);
	out[2] = az + t * (Number(b[2]) - az);
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

export type Source2OperatorParamValue = number | number[];/*TODO: improve type */

const operatorTempVec2_0 = vec2.create();
const operatorTempVec2_1 = vec2.create();
const operatorTempVec3_0 = vec3.create();
const operatorTempVec3_1 = vec3.create();

const DEFAULT_OP_STRENGTH = 1;// TODO: check default value
const DEFAULT_OP_START_FADE_IN_TIME = 0;// TODO: check default value
const DEFAULT_OP_END_FADE_IN_TIME = 0;// TODO: check default value
const DEFAULT_OP_START_FADE_OUT_TIME = 0;// TODO: check default value
const DEFAULT_OP_END_FADE_OUT_TIME = 0;// TODO: check default value
const DEFAULT_OP_FADE_OSCILLATE_PERIOD = 0;// TODO: check default value
export const DEFAULT_CONTROL_POINT_NUMBER = 0;// TODO: check default value

export class Operator {//TODOv3: rename this class ?
	static PVEC_TYPE_PARTICLE_VECTOR = false;
	#parameters: Record<string, OperatorParam> = {};// TODO: turn into Map<string,OperatorParam>
	system: Source2ParticleSystem
	protected opStartFadeInTime = DEFAULT_OP_START_FADE_IN_TIME;
	protected opEndFadeInTime = DEFAULT_OP_END_FADE_IN_TIME;
	protected opStartFadeOutTime = DEFAULT_OP_START_FADE_OUT_TIME;
	protected opEndFadeOutTime = DEFAULT_OP_END_FADE_OUT_TIME;
	protected opFadeOscillatePeriod = DEFAULT_OP_FADE_OSCILLATE_PERIOD;
	#normalizePerLiving = false;
	disableOperator = false;
	controlPointNumber = DEFAULT_CONTROL_POINT_NUMBER;
	#fieldInput = -1;
	protected fieldOutput = -1;
	scaleCp?: number;
	mesh?: Mesh;
	endCapState?: number;
	currentTime = 0;
	operateAllParticlesRemoveme = false;
	//protected opStrength = DEFAULT_OP_STRENGTH;

	constructor(system: Source2ParticleSystem) {
		this.system = system;
	}

	setParam(paramName: string, param: /*Source2OperatorParamValue*/OperatorParam) {
		/*
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
		*/
		this.#parameters[paramName] = param;
		this._paramChanged(paramName, param);
	}

	getParam(paramName: string) {
		return this.#parameters[paramName];
	}

	getParamScalarValue(paramName: string, particle?: Source2Particle): number | null {
		const parameter = this.#parameters[paramName];
		if (parameter) {
			return this.#getParamScalarValue(parameter, particle);
		}
		return null;
	}

	#getParamScalarValue(parameter: OperatorParam, particle?: Source2Particle): number | null {
		let inputValue;
		const type = parameter.getSubValueAsString('m_nType');
		if (type) {
			switch (type) {
				case 'PF_TYPE_LITERAL':
					return parameter.getSubValueAsNumber('m_flLiteralValue') ?? 0;
					break;
				case 'PF_TYPE_PARTICLE_AGE':
					return particle?.currentTime ?? null;// TODO: not sure if this is the actual value
				case 'PF_TYPE_PARTICLE_NUMBER_NORMALIZED':
					if (this.#normalizePerLiving) {
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
					//TODO: use m_nBiasType (PF_BIAS_TYPE_EXPONENTIAL ...)
					return RemapValClampedBias(Math.random(), 0, 1, parameter.getSubValueAsNumber('m_flRandomMin') ?? 0, parameter.getSubValueAsNumber('m_flRandomMax') ?? 1, 0.5/*parameter.m_flBiasParameter*/);//TODO: use another bias function bias varies from -1 to 1
					break;
				case 'PF_TYPE_RANDOM_UNIFORM':
					// TODO: user m_nRandomMode (PF_RANDOM_MODE_CONSTANT ...)
					return RandomFloat(parameter.getSubValueAsNumber('m_flRandomMin') ?? 0, parameter.getSubValueAsNumber('m_flRandomMax') ?? 1);
					break;
				case 'PF_TYPE_COLLECTION_AGE':
					return this.#getParamScalarValue2(parameter, this.system.currentTime);
					break;
				case 'PF_TYPE_PARTICLE_NOISE':
					return this.#getParamScalarValue2(parameter, RandomFloat(parameter.getSubValueAsNumber('m_flNoiseOutputMin') ?? 0, parameter.getSubValueAsNumber('m_flNoiseOutputMax') ?? 1));
					break;
				case 'PF_TYPE_CONTROL_POINT_COMPONENT':
					const cp = this.system.getControlPoint(parameter.getSubValueAsNumber('m_nControlPoint') ?? 0);
					if (cp) {
						return cp.getPosition(operatorTempVec3_0)[parameter.getSubValueAsNumber('m_nVectorComponent') ?? 0] ?? 0;
					}
					return 0;
					break;
				case 'PF_TYPE_PARTICLE_FLOAT':
					// TODO: use m_nMapType (PF_MAP_TYPE_REMAP...)
					return inputValue = RemapValClamped(
						particle?.getField(parameter.getSubValueAsNumber('m_nScalarAttribute') ?? 0) as number ?? 0,
						parameter.getSubValueAsNumber('m_flInput0') ?? 0,
						parameter.getSubValueAsNumber('m_flInput1') ?? 1,
						parameter.getSubValueAsNumber('m_flOutput0') as number ?? 0,
						parameter.getSubValueAsNumber('m_flOutput1') ?? 1
					);
				case 'PF_TYPE_CONTROL_POINT_SPEED':
					// TODO: code me
					return null;
				default:
					console.error('#getParamScalarValue unknown type', parameter);
					throw 'Code me'
			}
		} else {
			return parameter.getValueAsNumber();
		}
	}

	#getParamScalarValue2/*TODO: rename to MapType*/(parameter: OperatorParam, inputValue: number): number {
		const mapType = parameter.getSubValueAsString('m_nMapType');

		if (!mapType) {
			return 0;
		}

		switch (mapType) {
			case 'PF_MAP_TYPE_DIRECT':
				return inputValue;
			case 'PF_MAP_TYPE_CURVE':
				return this.#getParamScalarValueCurve(parameter, inputValue);
			case 'PF_MAP_TYPE_MULT':
				console.error('do this getParamScalarValue2');
				return inputValue * (parameter.getSubValueAsNumber('m_flMultFactor') ?? 1/* TODO: check default value*/);
			case 'PF_MAP_TYPE_REMAP':
				return inputValue;//TODO
			default:
				console.error('Unknown map type : ', mapType, parameter);
				return 0;
		}
	}

	#getParamScalarValueCurve(parameter: OperatorParam, inputValue: number): number {
		const curve = parameter.getSubValue('m_Curve');
		if (!curve) {
			return 0;
		}

		const domainMins = curve?.getSubValueAsVec2('m_vDomainMins', operatorTempVec2_0);
		const domainMaxs = curve?.getSubValueAsVec2('m_vDomainMaxs', operatorTempVec2_1);

		if (!domainMins || !domainMaxs) {
			return 0;
		}


		const inputMin = domainMins[0];
		const inputMax = domainMaxs[0];
		const outputMin = domainMins[1];
		const outputMax = domainMaxs[1];
		//let modeClamped = parameter.m_nInputMode == "PF_INPUT_MODE_CLAMPED" ? true : false;

		// TODO: use params m_spline, m_tangents, see for instance particles/units/heroes/hero_dawnbreaker/dawnbreaker_ambient_hair.vpcf_c
		if (parameter.getSubValueAsString('m_nInputMode') == 'PF_INPUT_MODE_CLAMPED') {
			inputValue = clamp(inputValue, inputMin, inputMax);
		} else {
			//"PF_INPUT_MODE_LOOPED"
			//Note : the loop goes from 0 to inputMax, not inputMin to inputMax
			inputValue = inputMax !== 0 ? inputValue % inputMax : inputMin;

		}
		return this.#getCurveValue(curve, inputValue);
	}

	#getCurveValue(curve: OperatorParam/*TODO: improve type*/, x: number): number {
		//TODO: do a real curve
		const spline = curve.getSubValueAsArray('m_spline') as OperatorParam[];
		if (!spline) {
			return 0;
		}

		let previousKey = spline[0];
		if (!previousKey || !previousKey.isOperatorParam) {
			return 0;
		}

		let key: OperatorParam | undefined = previousKey;
		if (x < (previousKey.getSubValueAsNumber('x') ?? 0)) {
			return previousKey.getSubValueAsNumber('y') ?? 0;
		}

		let index = 0;
		while (key = spline[++index]) {
			const keyX = key.getSubValueAsNumber('x') ?? 0;
			const keyY = key.getSubValueAsNumber('y') ?? 0;
			const previousKeyX = previousKey.getSubValueAsNumber('x') ?? 0;
			const previousKeyY = previousKey.getSubValueAsNumber('y') ?? 0;
			if (x < keyX) {
				return lerp(previousKeyY, keyY, (x - previousKeyX) / (keyX - previousKeyX));
			}
			previousKey = key;
		}
		return previousKey.getSubValueAsNumber('y') ?? 0;
		//export function lerp(min, max, v) {
	}


	getParamVectorValue(out: vec4/*not sure about vec4. maybe vec3 ?*/, paramName: string, particle?: Source2Particle): vec4 | undefined | null {
		const parameter = this.#parameters[paramName];
		if (!parameter) {
			return undefined;
		}

		const type = parameter.getSubValueAsString('m_nType');
		if (type) {
			switch (type) {
				case 'PVEC_TYPE_LITERAL':
					//console.error('do this param', paramName, parameter);
					//return parameter.m_vLiteralValue;
					parameter.getSubValueAsVec3('m_vLiteralValue', out as vec3);
					break;
				case 'PVEC_TYPE_LITERAL_COLOR':
					return parameter.getValueAsVec3(out as vec3) as vec4;
				case 'PVEC_TYPE_PARTICLE_VECTOR':
					if (!Operator.PVEC_TYPE_PARTICLE_VECTOR) {
						Operator.PVEC_TYPE_PARTICLE_VECTOR = true;
						throw 'Code me';
					}
					break;
				case 'PVEC_TYPE_FLOAT_INTERP_GRADIENT':
					return this.#getParamVectorValueFloatInterpGradient(out, parameter, particle);
					break;
				case 'PVEC_TYPE_FLOAT_COMPONENTS':
					console.error('fix me: PVEC_TYPE_FLOAT_COMPONENTS', parameter);
					const componentX = parameter.getSubValue('m_FloatComponentX');
					const componentY = parameter.getSubValue('m_FloatComponentX');
					const componentZ = parameter.getSubValue('m_FloatComponentX');
					if (componentX && componentY && componentZ) {
						out[0] = this.#getParamScalarValue(componentX, particle) ?? 0/* TODO: check default value*/;
						out[1] = this.#getParamScalarValue(componentY, particle) ?? 0/* TODO: check default value*/;
						out[2] = this.#getParamScalarValue(componentZ, particle) ?? 0/* TODO: check default value*/;
					}
					break;
				case 'PVEC_TYPE_RANDOM_UNIFORM_OFFSET':
					if (parameter.getSubValueAsVec3('m_vRandomMin', operatorTempVec3_0) &&
						parameter.getSubValueAsVec3('m_vRandomMax', operatorTempVec3_1)) {
						vec3RandomBox(out as vec3, operatorTempVec3_0, operatorTempVec3_1);
					}
					break;
				case 'PVEC_TYPE_CP_VALUE':
					const cp = this.system.getControlPoint(parameter.m_nControlPoint);
					if (cp) {
						vec3.copy(out as vec3, cp.currentWorldPosition);
						if (parameter.m_vCPValueScale) {
							vec3.mul(out as vec3, out as vec3, parameter.m_vCPValueScale);
						}
					}
					break;
				case 'PVEC_TYPE_RANDOM_UNIFORM':
					//TODO
					break;
				default:
					console.error('getParamVectorValue unknown type', type, parameter);
					throw 'Code me'
			}
		} else {
			const value = parameter.getValueAsArray();
			if (value) {
				for (let i = 0; i < 4; i++) {
					out[i] = (value as number[])[i] ?? 0;
				}
				return out;
			} else {
				console.error('value is not an array, investigate');
				return null
			}
		}
	}

	#getParamVectorValueFloatInterpGradient(out: vec4, parameter: OperatorParam, particle: Source2Particle | undefined): vec4 | null {
		const interpInput0 = parameter.getSubValueAsNumber('m_flInterpInput0');
		const interpInput1 = parameter.getSubValueAsNumber('m_flInterpInput1');
		const floatInterp = parameter.getSubValue('m_FloatInterp')
		if (!floatInterp || interpInput0 === null || interpInput1 === null) {
			return null;
		}
		let inputValue = this.#getParamScalarValue(floatInterp, particle);

		inputValue = RemapValClamped(inputValue, interpInput0, interpInput1, 0.0, 1.0);

		const gradient = parameter.getSubValue('m_Gradient');
		if (!gradient) {
			return null;
		}

		const stops = gradient.getSubValueAsArray('m_Stops') as OperatorParam[] | null;
		if (!stops || stops.length == 0) {
			return null;
		}
		//m_Color
		let previousStop = stops[0]!;
		let stop: OperatorParam | undefined = previousStop;
		if (inputValue < (previousStop.getSubValueAsNumber('m_flPosition') ?? 0)) {
			if (previousStop.getSubValueAsVec3('m_Color', out as vec3)) {
				return vec4.scale(out, out, COLOR_SCALE);
			}
		}

		let index = 0;
		while (stop = stops[++index]) {
			// TODO: optimize
			const previousStopColor = previousStop.getSubValueAsVec3('m_Color', operatorTempVec3_0);
			if (!previousStopColor) {
				return null;
			}
			const previousStopPosition = previousStop.getSubValueAsNumber('m_flPosition');
			if (previousStopPosition === null) {
				return null;
			}
			const stopColor = stop.getSubValueAsVec3('m_Color', operatorTempVec3_1);
			if (!stopColor) {
				return null;
			}
			const stopPosition = stop.getSubValueAsNumber('m_flPosition');
			if (stopPosition === null) {
				return null;
			}

			if (inputValue < (previousStop.getSubValueAsNumber('m_flPosition') ?? 0)) {
				vec3Lerp(out as vec3, previousStopColor, stopColor, (inputValue - previousStopPosition) / (stopPosition - previousStopPosition));
				return vec4.scale(out, out, COLOR_SCALE);
			}
			previousStop = stop;
		}
		if (previousStop.getSubValueAsVec3('m_Color', out as vec3)) {
			return out;
		}
		return null;
	}

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_bDisableOperator':
				this.disableOperator = param.getValueAsBool() ?? false;
				break;
			case 'm_nOpEndCapState':
				const endCapState = param.getValueAsString();
				if (endCapState === null) {
					console.error('wrong type for', paramName, param);
				}
				//TODO: do it properly
				if (endCapState == 'PARTICLE_ENDCAP_ENDCAP_ON') {
					this.disableOperator = true;
				} else {
					if (endCapState == 'PARTICLE_ENDCAP_ENDCAP_OFF') {
						this.disableOperator = false;
					} else {
						console.error('unknown value', paramName, param);
					}
				}
				break;
			case 'm_flOpStartFadeInTime':
				this.opStartFadeInTime = param.getValueAsNumber() ?? DEFAULT_OP_START_FADE_IN_TIME;
				break;
			case 'm_flOpEndFadeInTime':
				this.opEndFadeInTime = param.getValueAsNumber() ?? DEFAULT_OP_END_FADE_IN_TIME;
				break;
			case 'm_flOpStartFadeOutTime':
				this.opStartFadeOutTime = param.getValueAsNumber() ?? DEFAULT_OP_START_FADE_OUT_TIME;
				break;
			case 'm_flOpEndFadeOutTime':
				this.opEndFadeOutTime = param.getValueAsNumber() ?? DEFAULT_OP_END_FADE_OUT_TIME;
				break;
			case 'm_flOpFadeOscillatePeriod':
				this.opFadeOscillatePeriod = param.getValueAsNumber() ?? DEFAULT_OP_FADE_OSCILLATE_PERIOD;
				break;
			case 'm_nControlPointNumber':
				this.controlPointNumber = param.getValueAsNumber() ?? 0;
				break;
			case 'm_nOrientationType':
				this.setOrientationType(param.getValueAsString() ?? '');//TODO: default value ?
				break;
			case 'm_nFieldInput':
				console.error('do this param', paramName, param);
				if (TESTING && this.#fieldInput === undefined) {
					throw 'this.fieldInput must have a default value';
				}
				this.#fieldInput = (param);
				break;
			case 'm_nFieldOutput': // TODO: check wether is it actually the same field
			case 'm_nOutputField':
				this.fieldOutput = param.getValueAsNumber() ?? -1;
				break;
			case 'm_nOpScaleCP':
				console.error('do this param', paramName, param);
				this.scaleCp = (param);
				break;
			case 'm_flOpStrength':
				//this.opStrength = param.getValueAsNumber() ?? DEFAULT_OP_STRENGTH;
				// used in operateParticle
				break;
			case 'm_Notes':
				console.info(this.constructor.name, 'notes:', param.getValueAsString());
				//this.opStrength = param.getValueAsNumber() ?? DEFAULT_OP_STRENGTH;
				// used in operateParticle
				break;
			/*
		case 'm_flAlphaScale':
			throw 'do m_fSpeedRandExp';
			//handled in operator
			break;
			*/
			default:
				console.warn(this.constructor.name + ' : unknown parameter : ' + paramName, param);
		}
	}

	initializeParticle(particles: Source2Particle, elapsedTime: number) {
		if (!particles || this.disableOperator) {
			return;
		}
		let strength = 1;// TODO: use m_flOpStrength?
		// TODO: use checkIfOperatorShouldRun
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
			let strength = this.getParamScalarValue('m_flOpStrength') ?? DEFAULT_OP_STRENGTH;
			// TODO: use checkIfOperatorShouldRun
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
		this.doForce(particle, elapsedTime, accumulatedForces, 1/*TODO: compute actual strengh*/);
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

	#checkIfOperatorShouldRun() {
		// use opFadeOscillatePeriod
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

	getParameter(name: string): OperatorParam | null {
		return this.#parameters[name] ?? null;
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
				console.error('Unknown orientationType ', orientationType);
		}
	}

	init() {
		//This function is called after parameters are set
	}

	dispose() {
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void { }
	doEmit(elapsedTime: number): void { }
	doOperate(particle: Source2Particle | null | Source2Particle[], elapsedTime: number, strength: number): void { }
	doForce(particle: Source2Particle, elapsedTime: number, accumulatedForces: vec3, strength: number): void { }
	applyConstraint(particle: Source2Particle) { }
	doRender(particle: Source2Particle, elapsedTime: number, material: Source2Material) { }
	initRenderer(particleSystem: Source2ParticleSystem) { }
	updateParticles(particleSystem: Source2ParticleSystem, particleList: Source2Particle[], elapsedTime: number) { }
}
