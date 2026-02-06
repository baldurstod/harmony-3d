import { vec3 } from 'gl-matrix';
import { Source2ParticleEndCapState, Source2ParticleScalarField, Source2ParticleSelection, Source2ParticleTintBlendMode, Source2PinBreakType } from '../enums';

export const OPERATOR_PARAM_DISABLE_OPERATOR = 'm_bDisableOperator';

export const OPERATOR_PARAM_EVEN_DISTRUBUTION = 'm_bEvenDistribution';
export const OPERATOR_PARAM_MOD_2X = 'm_bMod2X';

export const OPERATOR_PARAM_COLOR_MAX = 'm_ColorMax';
export const OPERATOR_PARAM_COLOR_MIN = 'm_ColorMin';

export const OPERATOR_PARAM_DEGREES_MAX = 'm_flDegreesMax';
export const OPERATOR_PARAM_DEGREES_MIN = 'm_flDegreesMin';
export const OPERATOR_PARAM_INITIAL_RADIUS = 'm_flInitialRadius';
export const OPERATOR_PARAM_INITIAL_SPEED_MAX = 'm_flInitialSpeedMax';
export const OPERATOR_PARAM_INITIAL_SPEED_MIN = 'm_flInitialSpeedMin';
export const OPERATOR_PARAM_RADIUS_MAX = 'm_flRadiusMax';
export const OPERATOR_PARAM_RADIUS_MIN = 'm_flRadiusMin';

export const OPERATOR_PARAM_TEXTURE = 'm_hTexture';


export const OPERATOR_PARAM_ALPHA_MAX = 'm_nAlphaMax';
export const OPERATOR_PARAM_ALPHA_MIN = 'm_nAlphaMin';

export const OPERATOR_PARAM_ORIENTATION_TYPE = 'm_nOrientationType';
export const OPERATOR_PARAM_SEQUENCE_COMBINE_MODE = 'm_nSequenceCombineMode';

export const OPERATOR_PARAM_OUTPUT_MAX = 'm_vecOutputMax';
export const OPERATOR_PARAM_OUTPUT_MIN = 'm_vecOutputMin';

export enum OperatorDefinitionType {
	Bool,
	Integer,
	Float,
	String,
	Enum,
	Vec2,
	Vec3,
	Vec4,
	Quat,
}

export type OperatorDefinitionValue = boolean | number | string | vec3 | OperatorDefinitionEnums;

export type OperatorDefinitionEnums =
	typeof Source2ParticleTintBlendMode |
	typeof Source2ParticleEndCapState |
	typeof Source2PinBreakType |
	typeof Source2ParticleSelection;

export type OperatorDefinition = {
	name: string;
	type: OperatorDefinitionType;
	enum?: OperatorDefinitionEnums;
	defaultValue: OperatorDefinitionValue;
	complex: boolean;
};

const operatorParams = new Map<string, OperatorDefinition>();

function addOperatorDefinitions(defs: OperatorDefinition[]): void {
	for (const def of defs) {
		operatorParams.set(def.name, def);
	}
}


addOperatorDefinitions([
	// From C_OP_PinParticleToCP
	/*
	{ name: 'm_nOpEndCapState', type: OperatorDefinitionType.Enum, enum: Source2ParticleEndCapState, defaultValue: Source2ParticleEndCapState.AlwaysEnabled, complex: false },
	{ name: 'm_nPinBreakType', type: OperatorDefinitionType.Enum, enum: Source2PinBreakType, defaultValue: Source2PinBreakType.None, complex: false },
	{ name: 'm_nControlPointNumber', type: OperatorDefinitionType.Integer, defaultValue: 0, complex: false },
	{ name: 'm_vecOffset', type: OperatorDefinitionType.Vec3, defaultValue: vec3.create(), complex: true },
	{ name: 'm_bOffsetLocal', type: OperatorDefinitionType.Bool, defaultValue: true, complex: false },
	{ name: 'm_nParticleSelection', type: OperatorDefinitionType.Enum, enum: Source2ParticleSelection, defaultValue: Source2ParticleSelection.First, complex: false },
	{ name: 'm_nParticleNumber', type: OperatorDefinitionType.Integer, defaultValue: 0, complex: true },
	{ name: 'm_flBreakDistance', type: OperatorDefinitionType.Float, defaultValue: 1.75, complex: true },
	{ name: 'm_flBreakSpeed', type: OperatorDefinitionType.Float, defaultValue: 0, complex: true },
	{ name: 'm_flAge', type: OperatorDefinitionType.Float, defaultValue: 0, complex: true },
	{ name: 'm_nBreakControlPointNumber', type: OperatorDefinitionType.Integer, defaultValue: -1, complex: false },
	{ name: 'm_nBreakControlPointNumber2', type: OperatorDefinitionType.Integer, defaultValue: -1, complex: false },
	{ name: 'm_flBreakValue', type: OperatorDefinitionType.Float, defaultValue: 0, complex: true },
	{ name: 'm_flInterpolation', type: OperatorDefinitionType.Float, defaultValue: 1, complex: true },
	{ name: 'm_bRetainInitialVelocity', type: OperatorDefinitionType.Bool, defaultValue: false, complex: false },
	{ name: 'm_flOpStrength', type: OperatorDefinitionType.Float, defaultValue: 1, complex: true },
	{ name: 'm_nOpEndCapState', type: OperatorDefinitionType.Enum, defaultValue: Source2ParticleEndCapState.AlwaysEnabled, complex: false },
	 */
	// From C_OP_SetFloat
	{ name: 'm_InputValue', type: OperatorDefinitionType.Float, defaultValue: 0, complex: true },
	{ name: 'm_nOutputField', type: OperatorDefinitionType.Enum, defaultValue: Source2ParticleScalarField.Radius, complex: false },


]);
