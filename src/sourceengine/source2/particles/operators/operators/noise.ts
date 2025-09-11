import { vec3 } from 'gl-matrix';
import { DEG_TO_RAD } from '../../../../../math/constants';
import { NoiseSIMD } from '../../../../common/math/noise';
import { ATTRIBUTES_WHICH_ARE_ANGLES } from '../../../../common/particles/particlefields';
import { Source2ParticleScalarField } from '../../enums';
import { Source2Particle } from '../../source2particle';
import { Source2ParticleSystem } from '../../source2particlesystem';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const Coord = vec3.create();

const DEFAULT_FIELD_OUTPUT = Source2ParticleScalarField.Radius;
const DEFAULT_OUTPUT_MIN = 0;
const DEFAULT_OUTPUT_MAX = 1;
const DEFAULT_NOISE_SCALE = 0.1;
const DEFAULT_ADDITIVE = false;
const DEFAULT_NOISE_ANIMATION_TIME_SCALE = 0;

export class Noise extends Operator {//Noise scalar
	#fieldOutput = DEFAULT_FIELD_OUTPUT;
	#outputMin = DEFAULT_OUTPUT_MIN;
	#outputMax = DEFAULT_OUTPUT_MAX;
	#noiseScale = DEFAULT_NOISE_SCALE;//noise coordinate scale
	#additive = DEFAULT_ADDITIVE;
	#noiseAnimationTimeScale = DEFAULT_NOISE_ANIMATION_TIME_SCALE;
	// computed
	#outputMinRad = 0;
	#outputMaxRad = 0;
	#valueScale = 0;
	#valueBase = 0;

	constructor(system: Source2ParticleSystem) {
		super(system);
		this.#update();
	}

	#update() {
		if (ATTRIBUTES_WHICH_ARE_ANGLES & (1 << this.#fieldOutput)) {
			this.#outputMinRad = this.#outputMin * DEG_TO_RAD;
			this.#outputMaxRad = this.#outputMax * DEG_TO_RAD;
		} else {
			this.#outputMinRad = this.#outputMin;
			this.#outputMaxRad = this.#outputMax;
		}

		this.#valueScale = 0.5 * (this.#outputMaxRad - this.#outputMinRad);
		this.#valueBase = this.#outputMinRad + this.#valueScale;
	}

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nFieldOutput':
				this.#fieldOutput = param.getValueAsNumber() ?? DEFAULT_FIELD_OUTPUT;
				this.#update();
				break;
			case 'm_flOutputMin'://TODO: mutualize
				this.#outputMin = param.getValueAsNumber() ?? DEFAULT_OUTPUT_MIN;
				this.#update();
				break;
			case 'm_flOutputMax'://TODO: mutualize
				this.#outputMax = param.getValueAsNumber() ?? DEFAULT_OUTPUT_MAX;
				this.#update();
				break;
			case 'm_fl4NoiseScale':
				this.#noiseScale = param.getValueAsNumber() ?? DEFAULT_NOISE_SCALE;
				break;
			case 'm_bAdditive':
				this.#additive = param.getValueAsBool() ?? DEFAULT_ADDITIVE;
				break;
			case 'm_flNoiseAnimationTimeScale':
				this.#noiseAnimationTimeScale = param.getValueAsNumber() ?? DEFAULT_NOISE_ANIMATION_TIME_SCALE;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		// TODO: use other params #additive, noiseAnimationTimeScale
		vec3.scale(Coord, particle.position, this.#noiseScale);
		const noise = NoiseSIMD(Coord[0], Coord[1], Coord[2]) * this.#valueScale + this.#valueBase;

		particle.setField(this.#fieldOutput, noise);

		//TODO: use m_fl4NoiseScale m_bAdditive m_flNoiseAnimationTimeScale
	}
}
RegisterSource2ParticleOperator('C_OP_Noise', Noise);
