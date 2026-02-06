import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_NOISE_SCALE = 1;// TODO: check default value
const DEFAULT_NOISE_SCALE_LOC = 1;// TODO: check default value

export class AgeNoise extends Operator {
	#noiseScale = DEFAULT_NOISE_SCALE;
	#noiseScaleLoc = DEFAULT_NOISE_SCALE_LOC;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flNoiseScale':
				this.#noiseScale = param.getValueAsNumber() ?? DEFAULT_NOISE_SCALE;
				break;
			case 'm_flNoiseScaleLoc':
				this.#noiseScaleLoc = param.getValueAsNumber() ?? DEFAULT_NOISE_SCALE_LOC;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(): void {
		//TODO
	}
}
RegisterSource2ParticleOperator('C_INIT_AgeNoise', AgeNoise);
