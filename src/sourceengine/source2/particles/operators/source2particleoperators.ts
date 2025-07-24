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
		case 'C_OP_OscillateVector':
		case 'C_OP_DampenToCP':
		case 'C_OP_RampScalarSpline':
		case 'C_OP_SetSingleControlPointPosition':
		case 'C_OP_SetControlPointOrientation':
		case 'C_OP_SetParentControlPointsToChildCP':
		case 'C_INIT_InitVec':
		case 'C_OP_Noise':
		case 'C_OP_Spin':
		case 'C_OP_SetControlPointFromObjectScale':
		case 'C_INIT_InitFromCPSnapshot':
		case 'C_INIT_PositionWarp':
		case 'C_OP_MovementRigidAttachToCP':
		case 'C_INIT_CreateFromParentParticles':
		case 'C_OP_RemapControlPointDirectionToVector':
		case 'C_OP_RenderTrails':
		case 'C_OP_OscillateScalar':
		case 'C_OP_RemapSpeed':
		case 'C_OP_RemapSpeedtoCP':
		case 'C_INIT_CreateOnModelAtHeight':
		case 'C_OP_LerpEndCapScalar':
		case 'C_INIT_InitSkinnedPositionFromCPSnapshot':
		case 'C_OP_SnapshotRigidSkinToBones':
		case 'C_INIT_InheritFromParentParticles':
		case 'C_INIT_AgeNoise':
		case 'C_OP_ClampScalar':
		case 'C_INIT_RemapCPtoVector':
		case 'C_OP_RepeatedTriggerChildGroup':
			break;
		default:
			console.warn('do operator ', operatorName);
			break;
	}
	return Source2ParticleOperators.get(operatorName);
}
