import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_NOISE_SCALE = 1;// TODO: check default value
const DEFAULT_NOISE_SCALE_LOC = 1;// TODO: check default value

export class AgeNoise extends Operator {
	#noiseScale = DEFAULT_NOISE_SCALE;
	#noiseScaleLoc = DEFAULT_NOISE_SCALE_LOC;

	_paramChanged(paramName: string, param: OperatorParam): void {
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

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO
	}
}
RegisterSource2ParticleOperator('C_INIT_AgeNoise', AgeNoise);
