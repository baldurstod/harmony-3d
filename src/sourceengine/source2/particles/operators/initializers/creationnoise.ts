import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_RADIUS, ATTRIBUTES_WHICH_ARE_ANGLES } from '../../../../common/particles/particlefields';
import { NoiseSIMD } from '../../../../common/math/noise';
import { DEG_TO_RAD } from '../../../../../math/constants';

export class CreationNoise extends Operator {
	fieldOutput = PARTICLE_FIELD_RADIUS;
	absVal = false;
	absValInv = false;
	offset = 0;
	outputMin = 0;
	outputMax = 0;
	noiseScale = 0.1;
	noiseScaleLoc = 0.001;
	offsetLoc = vec3.create();
	worldTimeScale = 0;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_bAbsVal':
				this.absVal = Number(value) != 0;
				break;
			case 'm_bAbsValInv':
				this.absValInv = Number(value) != 0;
				break;
			case 'm_flOffset':
				this.offset = Number(value);
				break;
			case 'm_flOutputMin':
				this.outputMin = Number(value);
				break;
			case 'm_flOutputMax':
				this.outputMax = Number(value);
				break;
			case 'm_flNoiseScale':
				this.noiseScale = Number(value);
				break;
			case 'm_flNoiseScaleLoc':
				this.noiseScaleLoc = Number(value);
				break;
			case 'm_vecOffsetLoc':
				vec3.copy(this.offsetLoc, value);
				break;
			case 'm_flWorldTimeScale':
				this.worldTimeScale = Number(value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doInit(particle, elapsedTime) {
		const fieldOutput = this.fieldOutput;
		//let nAbsVal = 0xffffffff;
		let flAbsScale = 0.5;
		if (this.absVal) {
			//nAbsVal = 0x7fffffff;
			flAbsScale = 1.0;
		}

		let fMin = this.outputMin;
		let fMax = this.outputMax;

		if (ATTRIBUTES_WHICH_ARE_ANGLES & (1 << fieldOutput)) {
			fMin *= DEG_TO_RAD;
			fMax *= DEG_TO_RAD;
		}

		const CoordScaleLoc = this.noiseScaleLoc;

		let ValueScale, ValueBase;
		ValueScale = ( flAbsScale *( fMax - fMin ) );
		ValueBase = ( fMin+ ( ( 1.0 - flAbsScale ) *( fMax - fMin ) ) );

		let CoordLoc, CoordWorldTime, CoordBase;
		//let pCreationTime = particle.cTime;//pParticles->GetFloatAttributePtr( PARTICLE_ATTRIBUTE_CREATION_TIME, start_p );
		const Offset = this.offset;
		const a = (particle.cTime + Offset) * this.noiseScale +  performance.now() * this.worldTimeScale;
		CoordBase = vec3.fromValues (a, a, a);
		CoordLoc = vec3.create();
		//CoordBase *= this.noiseScale;
		//CoordWorldTime = Vector( (Plat_MSTime() * m_flWorldTimeScale), (Plat_MSTime() * m_flWorldTimeScale), (Plat_MSTime() * m_flWorldTimeScale) );
		//CoordBase += CoordWorldTime;
		const Coord = vec3.create();
		//for( ; nParticleCount--; start_p++ )
		{
			vec3.copy(Coord, CoordBase);
			vec3.copy(CoordLoc, particle.position);

			vec3.add(CoordLoc, CoordLoc, this.offsetLoc);
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
			let flNoise = NoiseSIMD( Coord , 0, 0);

			//*( (int *) &flNoise)  &= nAbsVal;
			if (this.absVal) {
				flNoise = Math.abs(flNoise);
			}

			if ( this.absValInv )
			{
				flNoise = 1.0 - flNoise;
			}

			const flInitialNoise = ( ValueBase + ( ValueScale * flNoise ) );

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
