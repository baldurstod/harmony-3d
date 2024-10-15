import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { clamp, RemapValClamped, lerp } from '../../../../../math/functions';
import { PARTICLE_FIELD_RADIUS, ATTRIBUTES_WHICH_ARE_0_TO_1 } from '../../../../common/particles/particlefields';

const DEFAULT_COMPONENT_SCALE = vec3.fromValues(1, 1, 1);

export class DistanceToCP extends Operator {
	fieldOutput = PARTICLE_FIELD_RADIUS;
	inputMin = 0;
	inputMax = 128;
	outputMin = 0;
	outputMax = 1;
	startCP = 0;
	los = true;
	collisionGroupName = '';
	maxTraceLength = -1;
	losScale = 0;
	setMethod = null;
	activeRange = false;;
	additive = false;
	scaleInitialRange = false;
	outputMin1;
	outputMax1;

	_update() {
		if (ATTRIBUTES_WHICH_ARE_0_TO_1 & (1 << this.fieldOutput)) {
			this.outputMin1 = clamp(this.outputMin, 0, 1);
			this.outputMax1 = clamp(this.outputMax, 0, 1);
		} else {
			this.outputMin1 = this.outputMin;
			this.outputMax1 = this.outputMax;
		}
	}

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_vecComponentScale':
				break;
			case 'm_nFieldOutput':
				this.fieldOutput = Number(value);
				this._update();
				break;
			case 'm_flInputMin':
				this.inputMin = value;
				break;
			case 'm_flInputMax':
				this.inputMax = value;
				break;
			case 'm_flOutputMin':
				this.outputMin = value;
				this._update();
				break;
			case 'm_flOutputMax':
				this.outputMax = value;
				this._update();
				break;
			case 'm_nStartCP':
				this.startCP = Number(value);
				break;
			case 'm_bLOS':
				this.los = value;
				break;
			case 'm_CollisionGroupName':
				this.collisionGroupName = value;
				break;
			case 'm_flMaxTraceLength':
				this.maxTraceLength = value;
				break;
			case 'm_flLOSScale':
				this.losScale = value;
				break;
			case 'm_nSetMethod':
				this.setMethod = value;
				break;
			case 'm_bActiveRange':
				this.activeRange = value;
				break;
			case 'm_bAdditive':
				this.additive = value;
				break;
			case 'm_bScaleInitialRange':
				this.scaleInitialRange = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime, flStrength = 1) {
		let componentScale = this.getParamVectorValue('m_vecComponentScale') ?? DEFAULT_COMPONENT_SCALE;

		let flMin = this.outputMin1;
		let flMax = this.outputMax1;
		/*if ( ATTRIBUTES_WHICH_ARE_0_TO_1 & ( 1 << m_nFieldOutput ) )
		{
			flMin = clamp(m_flOutputMin, 0.0f, 1.0f );
			flMax = clamp(m_flOutputMax, 0.0f, 1.0f );
		}*/
		//Vector vecControlPoint1 = pParticles->GetControlPointAtCurrentTime( m_nStartCP );
		const vecControlPoint1 = this.system.getControlPointPosition(this.startCP);

		//let vecPosition2 = vec3.create();
		let vecDelta = vec3.create();
		let vecEndPoint = vec3.create();
		// FIXME: SSE-ize
		//for ( int i = 0; i < pParticles->m_nActiveParticles; ++i )
		{
			//Vector vecPosition2;
			//const float *pXYZ = pParticles->GetFloatAttributePtr(PARTICLE_ATTRIBUTE_XYZ, i );
			//vecPosition2 = Vector(pXYZ[0], pXYZ[4], pXYZ[8]);
			//vec3.copy(vecPosition2, particle.position);
			//Vector vecDelta = vecControlPoint1 - vecPosition2;
			vec3.sub(vecDelta, vecControlPoint1, particle.position);

			let flDistance = vec3.length(vecDelta);//vecDelta.Length();
			if ( this.activeRange && ( flDistance < this.inputMin || flDistance > this.inputMax ) )
			{
				return;//continue;
			}
			if ( this.los ) {
				//Vector vecEndPoint = vecPosition2;
				vec3.copy(vecEndPoint, particle.position);
				if ( this.maxTraceLength != -1.0 && this.maxTraceLength < flDistance )
				{
					//VectorNormalize(vecEndPoint);
					vec3.normalize(vecEndPoint, vecEndPoint);
					//vecEndPoint *= m_flMaxTraceLength;
					vec3.scale(vecEndPoint, vecEndPoint, this.maxTraceLength);
					//vecEndPoint += vecControlPoint1;
					vec3.add(vecEndPoint, vecEndPoint, vecControlPoint1);
				}
				/*CBaseTrace tr;
				g_pParticleSystemMgr->Query()->TraceLine( vecControlPoint1, vecEndPoint, MASK_OPAQUE_AND_NPCS, NULL , m_nCollisionGroupNumber, &tr );
				if (tr.fraction != 1.0f)
				{
					flDistance *= tr.fraction * m_flLOSScale;
				}*/
				//TODO

			}

			let flOutput = RemapValClamped( flDistance, this.inputMin, this.inputMax, flMin, flMax  );
			/*if ( m_bScaleInitialRange )
			{
				const float *pInitialOutput = pParticles->GetInitialFloatAttributePtr( m_nFieldOutput, i );
				flOutput = *pInitialOutput * flOutput;
			}*/
			//float *pOutput = pParticles->GetFloatAttributePtrForWrite( m_nFieldOutput, i );
			//TODO: use m_nSetMethod m_bActiveRange m_bAdditive m_bScaleInitialRange

			let output = particle.getField(this.fieldOutput);

			//*pOutput = Lerp (flStrength, *pOutput, flOutput);
			output = lerp(output, flOutput, flStrength);
			particle.setField(this.fieldOutput, output);
				//float *pOutput = pParticles->GetFloatAttributePtrForWrite( m_nFieldOutput, i );
				//float flOutput = RemapValClamped( flDistance, m_flInputMin, m_flInputMax, flMin, flMax  );
				//*pOutput = Lerp (flStrength, *pOutput, flOutput);
		}
	}
}
RegisterSource2ParticleOperator('C_OP_DistanceToCP', DistanceToCP);
