import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { NoiseSIMD } from '../../../../common/math/noise';
import { PARTICLE_FIELD_RADIUS, ATTRIBUTES_WHICH_ARE_ANGLES } from '../../../../common/particles/particlefields';
import { DEG_TO_RAD } from '../../../../../math/constants';

const Coord = vec3.create();

export class Noise extends Operator {
	fieldOutput = PARTICLE_FIELD_RADIUS;
	outputMin = 0;
	outputMax = 1;
	noiseScale = 0.1;
	additive = false;
	noiseAnimationTimeScale = 0;
	outputMin1;
	outputMax1;
	valueScale;
	valueBase;
	constructor(system) {
		super(system);
		this._update();
	}

	_update() {
		if (ATTRIBUTES_WHICH_ARE_ANGLES & (1 << this.fieldOutput)) {
			this.outputMin1 = this.outputMin * DEG_TO_RAD;
			this.outputMax1 = this.outputMax * DEG_TO_RAD;
		} else {
			this.outputMin1 = this.outputMin;
			this.outputMax1 = this.outputMax;
		}

		this.valueScale = 0.5 * (this.outputMax1 - this.outputMin1);
		this.valueBase = this.outputMin1 + this.valueScale;
	}

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nFieldOutput':
				this.fieldOutput = Number(value);
				this._update();
				break;
			case 'm_flOutputMin':
				this.outputMin = value;
				this._update();
				break;
			case 'm_flOutputMax':
				this.outputMax = value;
				this._update();
				break;
			case 'm_fl4NoiseScale':
				this.noiseScale = value;
				break;
			case 'm_bAdditive':
				this.additive = value;
				break;
			case 'm_flNoiseAnimationTimeScale':
				this.noiseAnimationTimeScale = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		vec3.scale(Coord, particle.position, this.noiseScale);
		const noise = NoiseSIMD(Coord, 0, 0) * this.valueScale + this.valueBase;

		particle.setField(this.fieldOutput, noise);

		//TODO: use m_fl4NoiseScale m_bAdditive m_flNoiseAnimationTimeScale
	}
}
RegisterSource2ParticleOperator('C_OP_Noise', Noise);
