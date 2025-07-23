import { RemapValClampedBias } from '../../../../../math/functions';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class RemapParticleCountToScalar extends Operator {
	inputMin = 0;
	inputMax = 10;
	scaleControlPoint = -1;
	scaleControlPointField = -1;
	outputMin = 0;
	outputMax = 1;
	setMethod = null;
	activeRange = false;
	invert = false;
	wrap = false;
	remapBias = 0.5;
	#fieldOutput = PARTICLE_FIELD_RADIUS;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nInputMin':
				this.inputMin = (param);
				break;
			case 'm_nInputMax':
				this.inputMax = (param);
				break;
			case 'm_nScaleControlPoint':
				this.scaleControlPoint = Number(param);
				break;
			case 'm_nScaleControlPointField':
				this.scaleControlPointField = Number(param);
				break;
			case 'm_flOutputMin':
				this.outputMin = param;
				break;
			case 'm_flOutputMax':
				this.outputMax = param;
				break;
			case 'm_nSetMethod':
				this.setMethod = param;
				break;
			case 'm_bActiveRange':
				this.activeRange = param;
				break;
			case 'm_bInvert':
				this.invert = param;
				break;
			case 'm_bWrap':
				this.wrap = param;
				break;
			case 'm_flRemapBias':
				this.remapBias = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle, elapsedTime) {
		//TODO: use bias, invert m_nScaleControlPointField parameters
		let value = particle.id;
		if (this.wrap) {
			value = value % (this.inputMax + 1);
		}

		if (this.activeRange && (value < this.inputMin || value > this.inputMax)) {
			return;
		}

		value = RemapValClampedBias(value, this.inputMin, this.inputMax, this.outputMin, this.outputMax, this.remapBias);
		particle.setField(this.#fieldOutput, value, this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
	}
}
RegisterSource2ParticleOperator('C_INIT_RemapParticleCountToScalar', RemapParticleCountToScalar);
