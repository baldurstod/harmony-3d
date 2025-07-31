

export enum Source2ParticleSetMethod {
	SetValue = 'PARTICLE_SET_VALUE',
	ScaleInitial = 'PARTICLE_SET_SCALE_INITIAL_VALUE',
	AddInitial = 'PARTICLE_SET_ADD_TO_INITIAL_VALUE',
	RampCurrent = 'PARTICLE_SET_RAMP_CURRENT_VALUE',//Ramp Current Value at Input Rate Per Second
	ScaleCurrent = 'PARTICLE_SET_SCALE_CURRENT_VALUE',//Scale Current Value Raw
	AddCurrent = 'PARTICLE_SET_ADD_TO_CURRENT_VALUE',
	Default = Source2ParticleSetMethod.SetValue,
	// TODO: find m_nSetMethod
}

export function stringToSetMethod(setMethod: string | null): Source2ParticleSetMethod | undefined {//TODO: improve ?
	switch (setMethod) {
		case Source2ParticleSetMethod.SetValue:
			return Source2ParticleSetMethod.SetValue;
		case Source2ParticleSetMethod.ScaleInitial:
			return Source2ParticleSetMethod.ScaleInitial;
		case Source2ParticleSetMethod.AddInitial:
			return Source2ParticleSetMethod.AddInitial;
		case Source2ParticleSetMethod.RampCurrent:
			return Source2ParticleSetMethod.RampCurrent;
		case Source2ParticleSetMethod.ScaleCurrent:
			return Source2ParticleSetMethod.ScaleCurrent;
		case Source2ParticleSetMethod.AddCurrent:
			return Source2ParticleSetMethod.AddCurrent;
		default:
			console.error('unsupported set method', setMethod);
	}
}


export enum Source2ParticleSelection {
	First = 'PARTICLE_SELECTION_FIRST',
	Last = 'PARTICLE_SELECTION_LAST',
	Number = 'PARTICLE_SELECTION_NUMBER',
}

export function stringToParticleSelection(selection: string | null): Source2ParticleSelection | undefined {//TODO: improve ?
	switch (selection) {
		case Source2ParticleSelection.First:
			return Source2ParticleSelection.First;
		case Source2ParticleSelection.Last:
			return Source2ParticleSelection.Last;
		case Source2ParticleSelection.Number:
			return Source2ParticleSelection.Number;
		default:
			console.error('unsupported particle selection', selection);
	}
}

export enum Source2PinBreakType {
	None = 'PARTICLE_PIN_DISTANCE_NONE',//Don't Break
	Neighbor = 'PARTICLE_PIN_DISTANCE_NEIGHBOR',//Distance to Neighboring Particle
	Farthest = 'PARTICLE_PIN_DISTANCE_FARTHEST',//Distance to Farthest Particle
	First = 'PARTICLE_PIN_DISTANCE_FIRST',//Distance to First Particle
	Last = 'PARTICLE_PIN_DISTANCE_LAST',//Distance to Last Particle
	Center = 'PARTICLE_PIN_DISTANCE_CENTER',//Distance to Particle System Center
	Cp = 'PARTICLE_PIN_DISTANCE_CP',//Distance to Control Point
	CpPair = 'PARTICLE_PIN_DISTANCE_CP_PAIR_EITHER',//Distance to Either of Two Control Points
	Speed = 'PARTICLE_PIN_SPEED',//Particle Speed
	CollectionAge = 'PARTICLE_PIN_COLLECTION_AGE',//Collection Age
	FloatValue = 'PARTICLE_PIN_FLOAT_VALUE',//Break Value of >= 1
}

export function stringToPinBreakType(breakType: string | null): Source2PinBreakType | undefined {//TODO: improve ?
	switch (breakType) {
		case Source2PinBreakType.None:
			return Source2PinBreakType.None;
		case Source2PinBreakType.Neighbor:
			return Source2PinBreakType.Neighbor;
		case Source2PinBreakType.Farthest:
			return Source2PinBreakType.Farthest;
		case Source2PinBreakType.First:
			return Source2PinBreakType.First;
		case Source2PinBreakType.Last:
			return Source2PinBreakType.Last;
		case Source2PinBreakType.Center:
			return Source2PinBreakType.Center;
		case Source2PinBreakType.Cp:
			return Source2PinBreakType.Cp;
		case Source2PinBreakType.CpPair:
			return Source2PinBreakType.CpPair;
		case Source2PinBreakType.Speed:
			return Source2PinBreakType.Speed;
		case Source2PinBreakType.CollectionAge:
			return Source2PinBreakType.CollectionAge;
		case Source2PinBreakType.FloatValue:
			return Source2PinBreakType.FloatValue;
		default:
			console.error('unsupported pin break type', breakType);
	}
}

export enum Source2ParticleTintBlendMode {
	Replace = 'PARTICLEBLEND_REPLACE',
	Overlay = 'PARTICLEBLEND_OVERLAY',
	Darken = 'PARTICLEBLEND_DARKEN',
	Lighten = 'PARTICLEBLEND_LIGHTEN',
	Multiply = 'PARTICLEBLEND_MULTIPLY',
}

export function stringToTintBlendMode(blend: string | null): Source2ParticleTintBlendMode | undefined {//TODO: improve ?
	switch (blend) {
		case Source2ParticleTintBlendMode.Replace:
			return Source2ParticleTintBlendMode.Replace;
		case Source2ParticleTintBlendMode.Overlay:
			return Source2ParticleTintBlendMode.Overlay;
		case Source2ParticleTintBlendMode.Darken:
			return Source2ParticleTintBlendMode.Darken;
		case Source2ParticleTintBlendMode.Lighten:
			return Source2ParticleTintBlendMode.Lighten;
		case Source2ParticleTintBlendMode.Multiply:
			return Source2ParticleTintBlendMode.Multiply;
		default:
			console.error('unsupported tint blend mode', blend);
	}
}

export enum Source2ParticleScalarField {// TODO: mutualize: those are the save values as source1
	LifeDuration = 1,
	Radius = 3,
	Roll = 4,
	RollSpeed = 5,
	Alpha = 7,
	CreationTime = 8,
	SequenceNumber = 9,
	TrailLength = 10,
	ParticleId = 11,
	Yaw = 12,
	SequenceNumber2 = 13,//Second Sequence Number / Alpha Window Threshold
	HitboxIndex = 14,
	AlphaAlternate = 16,
	ScratchFloat = 18,
	Disabled = 19,
	Pitch = 20,
	GlowAlpha = 23,
	ScratchFloat2 = 26,
	ScratchFloat3 = 27,
	BoneIndice = 31,
	ParentParticleIndex = 33,
	ForceScale = 34,
	ManualAnimationFrame = 38,
	ShaderExtraData1 = 39,
	ShaderExtraData2 = 40,
	BoxFlags = 44,
	UserEventStates = 45,
	ParentParticleId = 46,
	Default = Source2ParticleScalarField.Radius,
}

export enum Source2ParticleVectorField {// TODO: mutualize: those are the save values as source1
	Position = 0,
	PreviousPosition = 2,
	Color = 6,
	HitboxOffsetPosition = 15,
	ScratchVector = 17,
	Disabled = 19,
	Normal = 21,
	GlowRgb = 22,
	ScratchVector2 = 30,
	BoneWeights = 32,
	BoxMins = 41,
	BoxMaxs = 42,
	BoxAngles = 43,


	Default = Source2ParticleVectorField.Position,
}

export enum Source2ParticleEndCapState {
	AlwaysEnabled = 'PARTICLE_ENDCAP_ALWAYS_ON',//Always Enabled
	DisabledDuringEndCap = 'PARTICLE_ENDCAP_ENDCAP_OFF',//Disabled During Endcap
	EnabledDuringEndCap = 'PARTICLE_ENDCAP_ENDCAP_ON',//Only Enabled During Endcap
}

export enum Source2ParticleRotationSetType {//lock rotations to bone orientation
	None = 'PARTICLE_ROTATION_LOCK_NONE',//Don't Set
	SetRotations = 'PARTICLE_ROTATION_LOCK_ROTATIONS',//Set Rotations
	SetNormal = 'PARTICLE_ROTATION_LOCK_NORMAL',//Set Normal
}

export function stringToRotationSetType(rotationSetType: string | null): Source2ParticleRotationSetType | undefined {//TODO: improve ?
	switch (rotationSetType) {
		case Source2ParticleRotationSetType.None:
			return Source2ParticleRotationSetType.None;
		case Source2ParticleRotationSetType.SetRotations:
			return Source2ParticleRotationSetType.SetRotations;
		case Source2ParticleRotationSetType.SetNormal:
			return Source2ParticleRotationSetType.SetNormal;
		default:
			console.error('unsupported rotationSetType', rotationSetType);
	}
}

export enum Source2ParticleSnapshotReadType  {
	Increment = 'SNAPSHOT_INDEX_INCREMENT',
	Direct = 'SNAPSHOT_INDEX_DIRECT',
	Default = Source2ParticleSnapshotReadType.Increment,
}

export function stringToSnapshotReadType(snapshotReadType: string | null): Source2ParticleSnapshotReadType | undefined {//TODO: improve ?
	switch (snapshotReadType) {
		case Source2ParticleSnapshotReadType.Increment:
			return Source2ParticleSnapshotReadType.Increment;
		case Source2ParticleSnapshotReadType.Direct:
			return Source2ParticleSnapshotReadType.Direct;
		default:
			console.error('unsupported snapshotReadType', snapshotReadType);
	}
}

export enum Source2ParticleModelType  {
	ControlPoint = 'PM_TYPE_CONTROL_POINT',
	Model = 'PM_TYPE_NAMED_VALUE_MODEL',
	Entity = 'PM_TYPE_NAMED_VALUE_EHANDLE',
	Default = Source2ParticleModelType.ControlPoint,
}

export function stringToModelType(modelType: string | null): Source2ParticleModelType | undefined {//TODO: improve ?
	switch (modelType) {
		case Source2ParticleModelType.ControlPoint:
			return Source2ParticleModelType.ControlPoint;
		case Source2ParticleModelType.Model:
			return Source2ParticleModelType.Model;
		case Source2ParticleModelType.Entity:
			return Source2ParticleModelType.Entity;
		default:
			console.error('unsupported modelType', modelType);
	}
}

export enum Source2ParticleTransformType  {
	Invalid = 'PT_TYPE_INVALID',
	NamedValue = 'PT_TYPE_NAMED_VALUE',
	ControlPoint = 'PT_TYPE_CONTROL_POINT',
	ControlPointRange = 'PT_TYPE_CONTROL_POINT_RANGE',
	Default = Source2ParticleTransformType.ControlPoint,
}

export function stringToTransformType(transformType: string | null): Source2ParticleTransformType | undefined {//TODO: improve ?
	switch (transformType) {
		case Source2ParticleTransformType.Invalid:
			return Source2ParticleTransformType.Invalid;
		case Source2ParticleTransformType.NamedValue:
			return Source2ParticleTransformType.NamedValue;
		case Source2ParticleTransformType.ControlPoint:
			return Source2ParticleTransformType.ControlPoint;
		case Source2ParticleTransformType.ControlPointRange:
			return Source2ParticleTransformType.ControlPointRange;
		default:
			console.error('unsupported transformType', transformType);
	}
}


export enum Source2ParticleCpField {
	Disabled = -1,
	X = 0,
	Y = 1,
	Z = 2,
	Default = Source2ParticleCpField.X,
}
