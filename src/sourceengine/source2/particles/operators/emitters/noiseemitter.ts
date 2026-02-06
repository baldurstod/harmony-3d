import { vec3 } from 'gl-matrix';
import { Source2ParticleCpField } from '../../enums';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Emitter } from './emitter';


const DEFAULT_SCALE_CONTROL_POINT = -1;//disabled
const DEFAULT_SCALE_CONTROL_POINT_FIELD = Source2ParticleCpField.X;
const DEFAULT_WORLD_NOISE_POINT = -1;//disabled
const DEFAULT_ABS_VAL = false;
const DEFAULT_ABS_VAL_INV = false;
const DEFAULT_OFFSET = 0;
const DEFAULT_OUTPUT_MIN = 0;//emission minimum
const DEFAULT_OUTPUT_MAX = 100;//emission maximum
const DEFAULT_NOISE_SCALE = 0.1;
const DEFAULT_WORLD_NOISE_SCALE = 0.001;
const DEFAULT_WORLD_TIME_SCALE = 0;

export class NoiseEmitter extends Emitter {
	#scaleControlPoint = DEFAULT_SCALE_CONTROL_POINT;
	#scaleControlPointField = DEFAULT_SCALE_CONTROL_POINT_FIELD;
	#worldNoisePoint = DEFAULT_WORLD_NOISE_POINT;//world noise scale control point
	#absVal = DEFAULT_ABS_VAL;
	#absValInv = DEFAULT_ABS_VAL_INV;
	#offset = DEFAULT_OFFSET;//time coordinate offset
	#outputMin = DEFAULT_OUTPUT_MIN;
	#outputMax = DEFAULT_OUTPUT_MAX;
	#noiseScale = DEFAULT_NOISE_SCALE;//time noise coordinate scale
	#worldNoiseScale = DEFAULT_WORLD_NOISE_SCALE;
	#offsetLoc = vec3.create();//spatial coordinate offset
	#worldTimeScale = DEFAULT_WORLD_TIME_SCALE;//world time noise coordinate scale
	#remainder = 0;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nScaleControlPoint':
				this.#scaleControlPoint = param.getValueAsNumber() ?? DEFAULT_SCALE_CONTROL_POINT;
				break;
			case 'm_nScaleControlPointField':
				this.#scaleControlPointField = param.getValueAsNumber() ?? DEFAULT_SCALE_CONTROL_POINT_FIELD;
				break;
			case 'm_nWorldNoisePoint':
				this.#worldNoisePoint = param.getValueAsNumber() ?? DEFAULT_WORLD_NOISE_POINT;
				break;
			case 'm_bAbsVal':
				this.#absVal = param.getValueAsBool() ?? DEFAULT_ABS_VAL;
				break;
			case 'm_bAbsValInv':
				this.#absValInv = param.getValueAsBool() ?? DEFAULT_ABS_VAL_INV;
				break;
			case 'm_flOffset':
				this.#offset = param.getValueAsNumber() ?? DEFAULT_OFFSET;
				break;
			case 'm_flOutputMin':
				this.#outputMin = param.getValueAsNumber() ?? DEFAULT_OUTPUT_MIN;
				break;
			case 'm_flOutputMax':
				this.#outputMax = param.getValueAsNumber() ?? DEFAULT_OUTPUT_MAX;
				break;
			case 'm_flNoiseScale':
				this.#noiseScale = param.getValueAsNumber() ?? DEFAULT_NOISE_SCALE;
				break;
			case 'm_flWorldNoiseScale':
				this.#worldNoiseScale = param.getValueAsNumber() ?? DEFAULT_WORLD_NOISE_SCALE;
				break;
			case 'm_vecOffsetLoc':
				param.getValueAsVec3(this.#offsetLoc);
				break;
			case 'm_flWorldTimeScale':
				this.#worldTimeScale = param.getValueAsNumber() ?? DEFAULT_WORLD_TIME_SCALE;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doEmit(elapsedTime: number): void {
		//TODO: code me
		const emission_start_time = this.startTime;
		let emission_rate = (this.#outputMin + this.#outputMax) * 0.5;
		const emission_duration = this.emissionDuration;

		const fade = this.getOperatorFade();
		emission_rate *= fade;

		let currentTime = this.system.currentTime;

		if (currentTime < emission_start_time) return;
		if (emission_duration != 0 && (currentTime > emission_start_time + emission_duration)) return;

		let nToEmit = this.#remainder + elapsedTime * emission_rate;
		this.#remainder = nToEmit % 1;
		nToEmit = Math.floor(nToEmit);

		const timeStampStep = elapsedTime / nToEmit;
		for (let i = 0; i < nToEmit; ++i) {
			const particle = this.emitParticle(currentTime, elapsedTime);
			if (particle == null) {
				break; // Break if a particule can't emitted (max reached)
			}
			currentTime += timeStampStep;
		}
	}
}
RegisterSource2ParticleOperator('C_OP_NoiseEmitter', NoiseEmitter);
