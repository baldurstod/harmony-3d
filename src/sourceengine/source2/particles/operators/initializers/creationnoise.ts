import { vec3 } from 'gl-matrix';
import { DEG_TO_RAD } from '../../../../../math/constants';
import { NoiseSIMD } from '../../../../common/math/noise';
import { ATTRIBUTES_WHICH_ARE_ANGLES } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2ParticleScalarField } from '../../enums';

const DEFAULT_FIELD_OUTPUT = Source2ParticleScalarField.Radius;
const DEFAULT_ABS_VAL = false;
const DEFAULT_ABS_VAL_INV = false;
const DEFAULT_OFFSET = 0;
const DEFAULT_OUTPUT_MIN = 0;
const DEFAULT_OUTPUT_MAX = 1;
const DEFAULT_NOISE_SCALE = 0.1;
const DEFAULT_NOISE_SCALE_LOC = 0.001;
const DEFAULT_WORLD_TIME_SCALE = 0;

export class CreationNoise extends Operator {//Remap noise to scalar
	#fieldOutput = DEFAULT_FIELD_OUTPUT;
	#absVal = DEFAULT_ABS_VAL;
	#absValInv = DEFAULT_ABS_VAL_INV;
	#offset = DEFAULT_OFFSET;
	#outputMin = DEFAULT_OUTPUT_MIN;
	#outputMax = DEFAULT_OUTPUT_MAX;
	#noiseScale = DEFAULT_NOISE_SCALE;
	#noiseScaleLoc = DEFAULT_NOISE_SCALE_LOC;
	#offsetLoc = vec3.create();//spatial coordinate offset
	#worldTimeScale = DEFAULT_WORLD_TIME_SCALE;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nFieldOutput':
				this.#fieldOutput = param.getValueAsNumber() ?? DEFAULT_FIELD_OUTPUT;
				break;
			case 'm_bAbsVal':
				this.#absVal = param.getValueAsBool() ?? DEFAULT_ABS_VAL;
				break;
			case 'm_bAbsValInv':
				this.#absValInv = param.getValueAsBool() ?? DEFAULT_ABS_VAL_INV;
				break;
			case 'm_flOffset':
				this.#offset = param.getValueAsNumber() ?? DEFAULT_OFFSET;
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
			case 'm_flNoiseScaleLoc':
				this.#noiseScaleLoc = param.getValueAsNumber() ?? DEFAULT_NOISE_SCALE_LOC;
				break;
			case 'm_vecOffsetLoc':
				param.getValueAsVec3(this.#offsetLoc);
				break;
			case 'm_flWorldTimeScale'://TODO: mutualize
				this.#worldTimeScale = param.getValueAsNumber() ?? DEFAULT_WORLD_TIME_SCALE;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle: Source2Particle): void {
		const fieldOutput = this.fieldOutput;
		//let nAbsVal = 0xffffffff;
		let flAbsScale = 0.5;
		if (this.#absVal) {
			//nAbsVal = 0x7fffffff;
			flAbsScale = 1.0;
		}

		let fMin = this.#outputMin;
		let fMax = this.#outputMax;

		if (ATTRIBUTES_WHICH_ARE_ANGLES & (1 << fieldOutput)) {
			fMin *= DEG_TO_RAD;
			fMax *= DEG_TO_RAD;
		}

		const CoordScaleLoc = this.#noiseScaleLoc;

		const ValueScale = (flAbsScale * (fMax - fMin));
		const ValueBase = (fMin + ((1.0 - flAbsScale) * (fMax - fMin)));

		//let CoordWorldTime;
		//let pCreationTime = particle.cTime;//pParticles->GetFloatAttributePtr( PARTICLE_ATTRIBUTE_CREATION_TIME, start_p );
		const Offset = this.#offset;
		const a = (particle.cTime + Offset) * this.#noiseScale + performance.now() * this.#worldTimeScale;
		const CoordBase = vec3.fromValues(a, a, a);
		const CoordLoc = vec3.create();
		//CoordBase *= this.noiseScale;
		//CoordWorldTime = Vector( (Plat_MSTime() * m_flWorldTimeScale), (Plat_MSTime() * m_flWorldTimeScale), (Plat_MSTime() * m_flWorldTimeScale) );
		//CoordBase += CoordWorldTime;
		const Coord = vec3.create();
		//for( ; nParticleCount--; start_p++ )
		{
			vec3.copy(Coord, CoordBase);
			vec3.copy(CoordLoc, particle.position);

			vec3.add(CoordLoc, CoordLoc, this.#offsetLoc);
			//CoordLoc += m_vecOffsetLoc;

			vec3.scale(CoordLoc, CoordLoc, CoordScaleLoc);
			//CoordLoc *= CoordScaleLoc;
			vec3.add(Coord, Coord, CoordLoc);
			//Coord += CoordLoc;

			//fltx4 flNoise128;
			//FourVectors fvNoise;
			//let fvNoise = vec3.clone(Coord);
			//fvNoise.DuplicateVector( Coord );
			//flNoise128 = NoiseSIMD( fvNoise , 0);
			//float flNoise = SubFloat( flNoise128, 0 );
			let flNoise = NoiseSIMD(Coord[0], Coord[1], Coord[2]);

			//*( (int *) &flNoise)  &= nAbsVal;
			if (this.#absVal) {
				flNoise = Math.abs(flNoise);
			}

			if (this.#absValInv) {
				flNoise = 1.0 - flNoise;
			}

			const flInitialNoise = (ValueBase + (ValueScale * flNoise));

			/*
			//TODO
			if ( ATTRIBUTES_WHICH_ARE_0_TO_1 & (1 << m_nFieldOutput ) )
			{
				flInitialNoise = clamp(flInitialNoise, 0.0f, 1.0f );
			}*/

			//*( pAttr ) = flInitialNoise;

			particle.setInitialField(this.fieldOutput, flInitialNoise);
		}
	}
}
RegisterSource2ParticleOperator('C_INIT_CreationNoise', CreationNoise);
