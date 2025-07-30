import { vec3 } from 'gl-matrix';
import { NoiseSIMD } from '../../../../common/math/noise';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2Particle } from '../../source2particle';

const DEFAULT_OUTPUT_MIN = vec3.create();
const DEFAULT_OUTPUT_MAX = vec3.fromValues(1, 1, 1);
const DEFAULT_OFFSET_LOC = vec3.create();

const ofs_y = vec3.fromValues(100000.5, 300000.25, 9000000.75);
const ofs_z = vec3.fromValues(110000.25, 310000.75, 9100000.5);

const CoordLoc = vec3.create();
const Coord = vec3.create();
const Coord2 = vec3.create();
const Coord3 = vec3.create();
const poffset = vec3.create();

const DEFAULT_IGNORE_DT = false;

export class InitialVelocityNoise extends Operator {
	#absVal = vec3.create();
	#absValInv = vec3.create();
	#localSpace = false;
	#ignoreDt = DEFAULT_IGNORE_DT;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_vecAbsVal':
				param.getValueAsVec3(this.#absVal);
				break;
			case 'm_vecAbsValInv':
				param.getValueAsVec3(this.#absValInv);
				break;
			case 'm_bLocalSpace'://TODO: put this param in Operator ?
				this.#localSpace = param.getValueAsBool() ?? false;
				break;
			case 'm_bIgnoreDt':
				this.#ignoreDt = param.getValueAsBool() ?? DEFAULT_IGNORE_DT;
				break;
			//TODO: m_TransformInput
			case 'm_vecOutputMin':
			case 'm_vecOutputMax':
			case 'm_vecOffsetLoc':
			case 'm_flOffset':
			case 'm_flNoiseScale':
			case 'm_flNoiseScaleLoc':
				//used in doInit
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: use m_vecOffsetLoc, m_vecOutputMin,m_vecOutputMax,  m_flOffset, m_flNoiseScale, m_flNoiseScaleLoc
		//TODO: fix this operator
		/*

		const outputMin = this.getParamVectorValue('m_vecOutputMin') ?? DEFAULT_OUTPUT_MIN;
		const outputMax = this.getParamVectorValue('m_vecOutputMax') ?? DEFAULT_OUTPUT_MAX;
		const offsetLoc = this.getParamVectorValue('m_vecOffsetLoc') ?? DEFAULT_OFFSET_LOC;
		const offset = this.getParamScalarValue('m_flOffset') ?? 0;
		const noiseScale = this.getParamScalarValue('m_flNoiseScale') ?? 1;
		const noiseScaleLoc = this.getParamScalarValue('m_flNoiseScaleLoc') ?? 0.01;


		//let nAbsValX = 0xffffffff;
		//let nAbsValY = 0xffffffff;
		//let nAbsValZ = 0xffffffff;
		let flAbsScaleX = 0.5;
		let flAbsScaleY = 0.5;
		let flAbsScaleZ = 0.5;
		// Set up single if check for absolute value inversion inside the loop
		const m_bNoiseAbs = (this.#absValInv[0] != 0.0) || (this.#absValInv[1] != 0.0) || (this.#absValInv[2] != 0.0);
		// Set up values for more optimal absolute value calculations inside the loop
		if (this.#absVal[0] != 0.0) {
			//nAbsValX = 0x7fffffff;
			flAbsScaleX = 1.0;
		}
		if (this.#absVal[1] != 0.0) {
			//nAbsValY = 0x7fffffff;
			flAbsScaleY = 1.0;
		}
		if (this.#absVal[2] != 0.0) {
			//nAbsValZ = 0x7fffffff;
			flAbsScaleZ = 1.0;
		}

		//float ValueScaleX, ValueScaleY, ValueScaleZ, ValueBaseX, ValueBaseY, ValueBaseZ;

		const ValueScaleX = flAbsScaleX * (outputMax[0] - outputMin[0]);
		const ValueBaseX = outputMin[0] + ((1.0 - flAbsScaleX) * (outputMax[0] - outputMin[0]));

		const ValueScaleY = (flAbsScaleY * (outputMax[1] - outputMin[1]));
		const ValueBaseY = (outputMin[1] + ((1.0 - flAbsScaleY) * (outputMax[1] - outputMin[1])));

		const ValueScaleZ = (flAbsScaleZ * (outputMax[2] - outputMin[2]));
		const ValueBaseZ = (outputMin[2] + ((1.0 - flAbsScaleZ) * (outputMax[2] - outputMin[2])));


		//float CoordScale = m_flNoiseScale;
		//float CoordScaleLoc = m_flNoiseScaleLoc;

		//for( ; nParticleCount--; start_p++ )
		{
			//const float *xyz = pParticles->GetFloatAttributePtr( PARTICLE_ATTRIBUTE_XYZ, start_p );
			//float *pxyz = pParticles->GetFloatAttributePtrForWrite( PARTICLE_ATTRIBUTE_PREV_XYZ, start_p );
			//const float *pCreationTime = pParticles->GetFloatAttributePtr( PARTICLE_ATTRIBUTE_CREATION_TIME, start_p );

			//Vector Coord, Coord2, Coord3, CoordLoc;
			//SetVectorFromAttribute( CoordLoc, xyz );
			//CoordLoc += m_vecOffsetLoc;
			vec3.add(CoordLoc, particle.position, offsetLoc);

			//float Offset = m_flOffset;
			const a = (particle.cTime + offset) * noiseScale;
			//Coord = Vector ( (*pCreationTime + Offset), (*pCreationTime + Offset), (*pCreationTime + Offset) );
			vec3.set(Coord, a, a, a);

			//Coord *= CoordScale;
			//CoordLoc *= CoordScaleLoc;
			vec3.scale(CoordLoc, CoordLoc, noiseScaleLoc);
			//Coord += CoordLoc;
			vec3.add(Coord, Coord, CoordLoc);

			//Coord2 = ( Coord );
			vec3.add(Coord2, Coord, ofs_y);
			//Coord3 = ( Coord );
			vec3.add(Coord3, Coord, ofs_z);

			//fltx4 flNoise128;
			//FourVectors fvNoise;

			/*fvNoise.DuplicateVector( Coord );
			flNoise128 = NoiseSIMD( fvNoise );
			float flNoiseX = SubFloat( flNoise128, 0 );* /
			let flNoiseX = NoiseSIMD(Coord, 0, 0);

			/*fvNoise.DuplicateVector( Coord2 + ofs_y );
			flNoise128 = NoiseSIMD( fvNoise );
			float flNoiseY = SubFloat( flNoise128, 0 );* /
			let flNoiseY = NoiseSIMD(Coord2, 0, 0);

			/*fvNoise.DuplicateVector( Coord3 + ofs_z );
			flNoise128 = NoiseSIMD( fvNoise );
			float flNoiseZ = SubFloat( flNoise128, 0 );* /
			let flNoiseZ = NoiseSIMD(Coord3, 0, 0);

			//*( (int *) &flNoiseX)  &= nAbsValX;
			//*( (int *) &flNoiseY)  &= nAbsValY;
			//*( (int *) &flNoiseZ)  &= nAbsValZ;
			if (this.#absVal[0]) {
				flNoiseX = Math.abs(flNoiseX);
			}

			if (this.#absVal[1]) {
				flNoiseY = Math.abs(flNoiseY);
			}

			if (this.#absVal[2]) {
				flNoiseZ = Math.abs(flNoiseZ);
			}

			if (m_bNoiseAbs) {
				if (this.#absValInv[0] != 0.0) {
					flNoiseX = 1.0 - flNoiseX;
				}

				if (this.#absValInv[1] != 0.0) {
					flNoiseY = 1.0 - flNoiseY;
				}
				if (this.#absValInv[2] != 0.0) {
					flNoiseZ = 1.0 - flNoiseZ;
				}
			}

			//Vector poffset;
			poffset[0] = (ValueBaseX + (ValueScaleX * flNoiseX)) * elapsedTime;
			poffset[1] = (ValueBaseY + (ValueScaleY * flNoiseY)) * elapsedTime;
			poffset[2] = (ValueBaseZ + (ValueScaleZ * flNoiseZ)) * elapsedTime;

			//poffset *= pParticles->m_flPreviousDt;

			if (this.#localSpace) {
				/*				matrix3x4_t mat;
								pParticles->GetControlPointTransformAtTime( m_nControlPointNumber, *pCreationTime, &mat );
								Vector vecTransformLocal = vec3_origin;
								VectorRotate( poffset, mat, vecTransformLocal );
								poffset = vecTransformLocal;* /
				const cp = this.system.getControlPoint(this.controlPointNumber);
				if (cp) {
					vec3.transformQuat(poffset, poffset, cp.getWorldQuaternion());
					//vec3.add(randpos, randpos, cp.getWorldPosition(vec));
				}
			}
			/*pxyz[0] -= poffset.x;
			pxyz[4] -= poffset.y;
			pxyz[8] -= poffset.z;* /
			vec3.sub(particle.prevPosition, particle.prevPosition, poffset);
		}
		*/
	}

	initMultipleOverride() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_INIT_InitialVelocityNoise', InitialVelocityNoise);
