import { vec3 } from 'gl-matrix';

import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { NoiseSIMD } from '../../../../common/math/noise';
import { PARTICLE_FIELD_COLOR } from '../../../../common/particles/particlefields';
import { Source2ParticleSystem } from '../../source2particlesystem';

const Coord = vec3.create();
const output = vec3.create();

const ofs_y = vec3.fromValues(100000.5, 300000.25, 9000000.75);
const ofs_z = vec3.fromValues(110000.25, 310000.75, 9100000.5);

const posScale = 0.00;
const timeScale = 0.1;

export class VectorNoise extends Operator {
	#outputMin = vec3.create();
	#outputMax = vec3.fromValues(1, 1, 1);
	fieldOutput = PARTICLE_FIELD_COLOR;
	noiseScale = 0.1;
	additive = false;
	offset = false;
	noiseAnimationTimeScale = 0;
	valueScale = vec3.create();
	valueBase = vec3.create();
	constructor(system: Source2ParticleSystem) {
		super(system);
		this.#update();
	}

	#update() {
		vec3.sub(this.valueScale, this.#outputMax, this.#outputMin);
		vec3.scale(this.valueScale, this.valueScale, 0.5);

		vec3.add(this.valueBase, this.#outputMin, this.valueScale);
		/*if (this.fieldOutput == PARTICLE_FIELD_COLOR) {
			vec3.scale(this.valueScale, this.valueScale, 1 / 255);
			vec3.scale(this.valueBase, this.valueBase, 1 / 255);
		}*/
	}

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_vecOutputMin':
				vec3.copy(this.#outputMin, value);
				this.#update();
				break;
			case 'm_vecOutputMax':
				vec3.copy(this.#outputMax, value);
				this.#update();
				break;
			case 'm_fl4NoiseScale':
				this.noiseScale = value;
				this.#update();
				break;
			case 'm_bAdditive':
				this.additive = value;
				break;
			case 'm_bOffset':
				this.offset = value;
				break;
			case 'm_flNoiseAnimationTimeScale':
				this.noiseAnimationTimeScale = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {

		//TODO: fix this operator ('particles/units/heroes/hero_dark_willow/dark_willow_head_ambient_smoke.vpcf_c')
		vec3.scale(Coord, particle.position, this.noiseScale * particle.currentTime * 0.001);

		output[0] = (NoiseSIMD(Coord[0], Coord[1], Coord[2]) * this.valueScale[0] + this.valueBase[0]);
		vec3.add(Coord, Coord, ofs_y);
		output[1] = (NoiseSIMD(Coord[0], Coord[1], Coord[2]) * this.valueScale[1] + this.valueBase[1]);
		vec3.add(Coord, Coord, ofs_z);
		output[2] = (NoiseSIMD(Coord[0], Coord[1], Coord[2]) * this.valueScale[2] + this.valueBase[2]);

		particle.setField(this.fieldOutput, output, undefined, undefined, this.additive);
	}
}
RegisterSource2ParticleOperator('C_OP_VectorNoise', VectorNoise);
