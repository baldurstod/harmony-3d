import { vec3 } from 'gl-matrix';
import { clamp, lerp, RemapValClamped } from '../../../../../math/functions';
import { ATTRIBUTES_WHICH_ARE_0_TO_1, PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

//const DEFAULT_COMPONENT_SCALE = vec3.fromValues(1, 1, 1);

//const distanceToCPTempVec4 = vec4.create();

const DEFAULT_INPUT_MIN = 0;// TODO: check default value
const DEFAULT_INPUT_MAX = 128;// TODO: check default value
const DEFAULT_OUTPUT_MIN = 0;// TODO: check default value
const DEFAULT_OUTPUT_MAX = 128;// TODO: check default value
const DEFAULT_LOS = true;// TODO: check default value
const DEFAULT_LOS_SCALE = 0;// TODO: check default value
const DEFAULT_COLLISION_GROUP_NAME = '';// TODO: check default value
const DEFAULT_MAX_TRACE_LENGTH = -1;// TODO: check default value
const DEFAULT_ACTIVE_RANGE = false;// TODO: check default value
const DEFAULT_ADDITIVE = false;// TODO: check default value
const DEFAULT_SCALE_INITIAL_RANGE = false;// TODO: check default value
const DEFAULT_START_CP = 0;// TODO: check default value

export class DistanceToCP extends Operator {
	//#fieldOutput = PARTICLE_FIELD_RADIUS/*TODO: create enum*/;
	#inputMin = DEFAULT_INPUT_MIN;
	#inputMax = DEFAULT_INPUT_MAX;
	#outputMin = DEFAULT_OUTPUT_MIN;
	#outputMax = DEFAULT_OUTPUT_MAX;
	#startCP = DEFAULT_START_CP;
	#los = DEFAULT_LOS;
	#collisionGroupName = DEFAULT_COLLISION_GROUP_NAME;
	#maxTraceLength = DEFAULT_MAX_TRACE_LENGTH;
	#losScale = DEFAULT_LOS_SCALE;
	#setMethod: string | null | undefined;
	#activeRange = DEFAULT_ACTIVE_RANGE;
	#additive = DEFAULT_ADDITIVE;
	#scaleInitialRange = DEFAULT_SCALE_INITIAL_RANGE;
	#outputMin1 = 0;// computed
	#outputMax1 = 0;// computed

	#update(): void {
		if (ATTRIBUTES_WHICH_ARE_0_TO_1 & (1 << this.fieldOutput)) {
			this.#outputMin1 = clamp(this.#outputMin, 0, 1);
			this.#outputMax1 = clamp(this.#outputMax, 0, 1);
		} else {
			this.#outputMin1 = this.#outputMin;
			this.#outputMax1 = this.#outputMax;
		}
	}

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_vecComponentScale':
				throw new Error(`do this param ${paramName}`);
				break;
			case 'm_nFieldOutput':
				this.fieldOutput = param.getValueAsNumber() ?? PARTICLE_FIELD_RADIUS;
				this.#update();
				break;
			case 'm_flInputMin':
				this.#inputMin = param.getValueAsNumber() ?? 0;
				break;
			case 'm_flInputMax':
				this.#inputMax = param.getValueAsNumber() ?? DEFAULT_INPUT_MAX;
				break;
			case 'm_flOutputMin':
				this.#outputMin = param.getValueAsNumber() ?? 0;
				this.#update();
				break;
			case 'm_flOutputMax':
				this.#outputMax = param.getValueAsNumber() ?? 1;
				this.#update();
				break;
			case 'm_nStartCP':
				this.#startCP = param.getValueAsNumber() ?? 0;
				break;
			case 'm_bLOS':
				this.#los = param.getValueAsBool() ?? DEFAULT_LOS;
				break;
			case 'm_CollisionGroupName':
				this.#collisionGroupName = param.getValueAsString() ?? DEFAULT_COLLISION_GROUP_NAME;
				break;
			case 'm_flMaxTraceLength':
				this.#maxTraceLength = param.getValueAsNumber() ?? DEFAULT_MAX_TRACE_LENGTH;
				break;
			case 'm_flLOSScale':
				this.#losScale = param.getValueAsNumber() ?? DEFAULT_LOS_SCALE;
				break;
			case 'm_nSetMethod':
				this.#setMethod = param.getValueAsString();
				break;
			case 'm_bActiveRange':
				this.#activeRange = param.getValueAsBool() ?? DEFAULT_ACTIVE_RANGE;
				break;
			case 'm_bAdditive':
				this.#additive = param.getValueAsBool() ?? DEFAULT_ADDITIVE;
				break;
			case 'm_bScaleInitialRange':
				this.#scaleInitialRange = param.getValueAsBool() ?? DEFAULT_SCALE_INITIAL_RANGE;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		//TODO: use setMethod
		//const componentScale: vec3 = this.getParamVectorValue(distanceToCPTempVec4, 'm_vecComponentScale', particle) as vec3 ?? DEFAULT_COMPONENT_SCALE;

		const flMin = this.#outputMin1;
		const flMax = this.#outputMax1;
		/*if ( ATTRIBUTES_WHICH_ARE_0_TO_1 & ( 1 << m_nFieldOutput ) )
		{
			flMin = clamp(m_flOutputMin, 0.0f, 1.0f );
			flMax = clamp(m_flOutputMax, 0.0f, 1.0f );
		}*/
		//Vector vecControlPoint1 = pParticles->GetControlPointAtCurrentTime( m_nStartCP );
		const vecControlPoint1 = this.system.getControlPointPosition(this.#startCP);

		//let vecPosition2 = vec3.create();
		const vecDelta = vec3.create();
		const vecEndPoint = vec3.create();
		// FIXME: SSE-ize
		//for ( int i = 0; i < pParticles->m_nActiveParticles; ++i )
		{
			//Vector vecPosition2;
			//const float *pXYZ = pParticles->GetFloatAttributePtr(PARTICLE_ATTRIBUTE_XYZ, i );
			//vecPosition2 = Vector(pXYZ[0], pXYZ[4], pXYZ[8]);
			//vec3.copy(vecPosition2, particle.position);
			//Vector vecDelta = vecControlPoint1 - vecPosition2;
			vec3.sub(vecDelta, vecControlPoint1, particle.position);

			const flDistance = vec3.length(vecDelta);//vecDelta.Length();
			if (this.#activeRange && (flDistance < this.#inputMin || flDistance > this.#inputMax)) {
				return;//continue;
			}
			if (this.#los) {
				//Vector vecEndPoint = vecPosition2;
				vec3.copy(vecEndPoint, particle.position);
				if (this.#maxTraceLength != -1.0 && this.#maxTraceLength < flDistance) {
					//VectorNormalize(vecEndPoint);
					vec3.normalize(vecEndPoint, vecEndPoint);
					//vecEndPoint *= m_flMaxTraceLength;
					vec3.scale(vecEndPoint, vecEndPoint, this.#maxTraceLength);
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

			const flOutput = RemapValClamped(flDistance, this.#inputMin, this.#inputMax, flMin, flMax);
			/*if ( m_bScaleInitialRange )
			{
				const float *pInitialOutput = pParticles->GetInitialFloatAttributePtr( m_nFieldOutput, i );
				flOutput = *pInitialOutput * flOutput;
			}*/
			//float *pOutput = pParticles->GetFloatAttributePtrForWrite( m_nFieldOutput, i );
			//TODO: use m_nSetMethod m_bActiveRange m_bAdditive m_bScaleInitialRange

			let output = particle.getScalarField(this.fieldOutput);

			//*pOutput = Lerp (flStrength, *pOutput, flOutput);
			output = lerp(output, flOutput, strength);
			particle.setField(this.fieldOutput, output);
			//float *pOutput = pParticles->GetFloatAttributePtrForWrite( m_nFieldOutput, i );
			//float flOutput = RemapValClamped( flDistance, m_flInputMin, m_flInputMax, flMin, flMax  );
			//*pOutput = Lerp (flStrength, *pOutput, flOutput);
		}
	}
}
RegisterSource2ParticleOperator('C_OP_DistanceToCP', DistanceToCP);
