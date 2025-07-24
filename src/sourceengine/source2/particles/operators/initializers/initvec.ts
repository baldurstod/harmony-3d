import { vec3, vec4 } from 'gl-matrix';
import { PARTICLE_FIELD_COLOR } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_INPUT_VALUE = vec3.create();
const initVecTempVec4 = vec4.create();

export class InitVec extends Operator {
	setMethod = null;
	scaleInitialRange = false;
	#fieldOutput = PARTICLE_FIELD_COLOR;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_InputValue':
				// used in doInit
				break;
			case 'm_nOutputField':

				console.error('do this param', paramName, param);
				this.#fieldOutput = (param);
				break;
			case 'm_nSetMethod':

				console.error('do this param', paramName, param);
				this.setMethod = param;
				break;
			case 'm_bScaleInitialRange':

				console.error('do this param', paramName, param);
				this.scaleInitialRange = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const inputValue = this.getParamVectorValue(initVecTempVec4, 'm_InputValue', particle) ?? DEFAULT_INPUT_VALUE;

		particle.setField(this.#fieldOutput, inputValue, this.scaleInitialRange || this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
	}
}
RegisterSource2ParticleOperator('C_INIT_InitVec', InitVec);
