import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { RemapValClampedBias } from '../../../../../math/functions';

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
	fieldOutput = PARTICLE_FIELD_RADIUS;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nInputMin':
				this.inputMin = Number(value);
				break;
			case 'm_nInputMax':
				this.inputMax = Number(value);
				break;
			case 'm_nScaleControlPoint':
				this.scaleControlPoint = Number(value);
				break;
			case 'm_nScaleControlPointField':
				this.scaleControlPointField = Number(value);
				break;
			case 'm_flOutputMin':
				this.outputMin = value;
				break;
			case 'm_flOutputMax':
				this.outputMax = value;
				break;
			case 'm_nSetMethod':
				this.setMethod = value;
				break;
			case 'm_bActiveRange':
				this.activeRange = value;
				break;
			case 'm_bInvert':
				this.invert = value;
				break;
			case 'm_bWrap':
				this.wrap = value;
				break;
			case 'm_flRemapBias':
				this.remapBias = value;
				break;
			default:
				super._paramChanged(paramName, value);
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
		particle.setField(this.fieldOutput, value, this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
	}
}
RegisterSource2ParticleOperator('C_INIT_RemapParticleCountToScalar', RemapParticleCountToScalar);
