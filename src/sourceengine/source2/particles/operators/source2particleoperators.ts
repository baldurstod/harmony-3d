import { Operator } from './operator';

const Source2ParticleOperators = new Map<string, typeof Operator>;


export function RegisterSource2ParticleOperator(operatorName: string, operator: typeof Operator) {
	Source2ParticleOperators.set(operatorName, operator);
}

export function GetSource2ParticleOperator(operatorName: string): typeof Operator | undefined {
	switch (operatorName) {//TODO: remove switch
		case 'C_OP_RemapCPtoScalar':
		case 'C_OP_ContinuousEmitter':
		case 'C_INIT_CreateWithinSphere':
		case 'C_OP_BasicMovement':
		case 'C_INIT_InitFloat':
		case 'C_INIT_RandomColor':
		case 'C_OP_InstantaneousEmitter':
		case 'C_OP_RenderModels':
		case 'C_OP_Decay':
		case 'C_INIT_RandomSequence':
		case 'C_OP_RenderSprites':
		case 'C_OP_ColorInterpolate':
		case 'C_OP_PositionLock':
		case 'C_OP_InterpolateRadius':
		case 'C_OP_FadeInSimple':
		case 'C_OP_RenderDeferredLight':
		case 'C_OP_SetToCP':
		case 'C_OP_FadeOutSimple':
		case 'C_OP_RemapCPOrientationToRotations':
		case 'C_INIT_RandomYawFlip':
		case 'C_OP_RampScalarLinearSimple':
		case 'C_OP_AttractToControlPoint':
		case 'C_OP_SpinUpdate':
		case 'C_OP_VectorNoise':
		case 'C_OP_DistanceToCP':
		case 'C_OP_ConstrainDistance':
		case 'C_OP_SetControlPointsToModelParticles':
		case 'C_INIT_InitialVelocityNoise':
		case 'C_OP_RenderRopes':
		case 'C_OP_FadeAndKill':
		case 'C_OP_SetControlPointToCenter':
		case 'C_OP_MaintainEmitter':
		case 'C_INIT_CreateOnModel':
		case 'C_INIT_PositionOffset':
		case 'C_OP_LockToBone':
		case 'C_OP_RampScalarLinear':
		case 'C_OP_SetFloat':
		case 'C_OP_NoiseEmitter':
		case 'C_OP_DistanceCull':
		case 'C_INIT_NormalOffset':
		case 'C_OP_TwistAroundAxis':
		case 'C_INIT_RandomSecondSequence':
			break;
		default:
			console.warn('do operator ', operatorName);
			break;
	}
	return Source2ParticleOperators.get(operatorName);
}
