import { vec3 } from 'gl-matrix';
import { Source2ParticleVectorField } from '../../enums';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const Coord = vec3.create();
const output = vec3.create();

const ofs_y = vec3.fromValues(100000.5, 300000.25, 9000000.75);
const ofs_z = vec3.fromValues(110000.25, 310000.75, 9100000.5);

//const posScale = 0.00;
//const timeScale = 0.1;

const DEFAULT_FIELD_OUTPUT = Source2ParticleVectorField.Color;
const DEFAULT_NOISE_SCALE = 0.1;
const DEFAULT_ADDITIVE = false;
const DEFAULT_OFFSET = false;
const DEFAULT_NOISE_ANIMATION_TIME_SCALE = 0;

export class VectorNoise extends Operator {
	#fieldOutput = DEFAULT_FIELD_OUTPUT;
	#outputMin = vec3.create();
	#outputMax = vec3.fromValues(1, 1, 1);
	#noiseScale = DEFAULT_NOISE_SCALE;//noise coordinate scale
	#additive = DEFAULT_ADDITIVE;
	#offset = DEFAULT_OFFSET;//offset instead of accelerate position
	#noiseAnimationTimeScale = DEFAULT_NOISE_ANIMATION_TIME_SCALE;
	#outputDelta = vec3.fromValues(1, 1, 1);;//computed

	#update(): void {
		vec3.sub(this.#outputDelta, this.#outputMax, this.#outputMin);
	}

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nFieldOutput':
				this.#fieldOutput = param.getValueAsNumber() ?? DEFAULT_FIELD_OUTPUT;
				this.#update();
				break;
			case 'm_vecOutputMin':
				param.getValueAsVec3(this.#outputMin);
				this.#update();
				break;
			case 'm_vecOutputMax':
				param.getValueAsVec3(this.#outputMax);
				this.#update();
				break;
			case 'm_fl4NoiseScale':
				this.#noiseScale = param.getValueAsNumber() ?? DEFAULT_NOISE_SCALE;
				this.#update();
				break;
			case 'm_bAdditive':
				this.#additive = param.getValueAsBool() ?? false;
				break;
			case 'm_bOffset':// TODO: mutualize
				this.#offset = param.getValueAsBool() ?? DEFAULT_OFFSET;
				break;
			case 'm_flNoiseAnimationTimeScale':
				this.#noiseAnimationTimeScale = param.getValueAsNumber() ?? DEFAULT_NOISE_ANIMATION_TIME_SCALE;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(particle: Source2Particle, elapsedTime: number): void {
		//TODO: fix this operator ('particles/units/heroes/hero_dark_willow/dark_willow_head_ambient_smoke.vpcf_c')
		vec3.scale(Coord, particle.position, this.#noiseScale * particle.currentTime * 0.001);

		// TODO: use an actual noise
		function NoiseSIMD(a: number, b: number, c: number): number {
			return Math.random();
		}

		output[0] = (NoiseSIMD(Coord[0], Coord[1], Coord[2]) * this.#outputDelta[0] + this.#outputMin[0]);
		vec3.add(Coord, Coord, ofs_y);
		output[1] = (NoiseSIMD(Coord[0], Coord[1], Coord[2]) * this.#outputDelta[1] + this.#outputMin[1]);
		vec3.add(Coord, Coord, ofs_z);
		output[2] = (NoiseSIMD(Coord[0], Coord[1], Coord[2]) * this.#outputDelta[2] + this.#outputMin[2]);

		if (this.#additive) {
			vec3.scale(output, output, elapsedTime);
		}
		particle.setField(this.#fieldOutput, output, undefined, undefined, this.#additive);
	}
}
RegisterSource2ParticleOperator('C_OP_VectorNoise', VectorNoise);
