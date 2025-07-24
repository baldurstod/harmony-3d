import { vec3 } from 'gl-matrix';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';


const DEFAULT_OUTPUT_MIN = 0;
const DEFAULT_OUTPUT_MAX = 100;
const DEFAULT_NOISE_SCALE = 0.1;

export class NoiseEmitter extends Operator {
	#emissionDuration = 0;
	#startTime = 0;
	#scaleControlPoint = -1;
	#scaleControlPointField = 0;
	#worldNoisePoint = -1;
	#absVal = false;
	#absValInv = false;
	#offset = 0;
	#outputMin = DEFAULT_OUTPUT_MIN;
	#outputMax = DEFAULT_OUTPUT_MAX;
	#noiseScale = DEFAULT_NOISE_SCALE;
	#worldNoiseScale = 0.001;
	#offsetLoc = vec3.create();
	#worldTimeScale = 0;
	#remainder = 0;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flEmissionDuration':
				console.error('do this param', paramName, param);
				this.#emissionDuration = param;
				break;
			case 'm_flStartTime':
				console.error('do this param', paramName, param);
				this.#startTime = param;
				break;
			case 'm_nScaleControlPoint':
				console.error('do this param', paramName, param);
				this.#scaleControlPoint = (param);
				break;
			case 'm_nScaleControlPointField':
				console.error('do this param', paramName, param);
				this.#scaleControlPointField = (param);
				break;
			case 'm_nWorldNoisePoint':
				console.error('do this param', paramName, param);
				this.#worldNoisePoint = (param);
				break;
			case 'm_bAbsVal':
				console.error('do this param', paramName, param);
				this.#absVal = param;
				break;
			case 'm_bAbsValInv':
				console.error('do this param', paramName, param);
				this.#absValInv = param;
				break;
			case 'm_flOffset':
				console.error('do this param', paramName, param);
				this.#offset = param;
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
				console.error('do this param', paramName, param);
				this.#worldNoiseScale = param;
				break;
			case 'm_vecOffsetLoc':
				console.error('do this param', paramName, param);
				vec3.copy(this.#offsetLoc, param);
				break;
			case 'm_flWorldTimeScale':
				console.error('do this param', paramName, param);
				this.#worldTimeScale = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doEmit(elapsedTime: number) {
		//TODO: code me
		const emission_start_time = this.#startTime;
		let emission_rate = (this.#outputMin + this.#outputMax) * 0.5;
		const emission_duration = this.#emissionDuration;

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
