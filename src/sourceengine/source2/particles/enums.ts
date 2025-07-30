

export enum Source2ParticleSetMethod {//TODO: move enum elsewhere
	ScaleInitial = 'PARTICLE_SET_SCALE_INITIAL_VALUE',
	AddCurrent = 'PARTICLE_SET_ADD_TO_CURRENT_VALUE',
	RampCurrent = 'PARTICLE_SET_RAMP_CURRENT_VALUE',
	// TODO: find m_nSetMethod
}

export function stringToSetMethod(setMethod: string | null): Source2ParticleSetMethod | undefined {//TODO: improve ?
	switch (setMethod) {
		case Source2ParticleSetMethod.ScaleInitial:
			return Source2ParticleSetMethod.ScaleInitial;
		case Source2ParticleSetMethod.AddCurrent:
			return Source2ParticleSetMethod.AddCurrent;
		case Source2ParticleSetMethod.RampCurrent:
			return Source2ParticleSetMethod.RampCurrent;
		default:
			console.error('unsupported pin break type', setMethod);
	}
}


export enum Source2ParticleSelection {//TODO: move enum elsewhere
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

export enum Source2PinBreakType {//TODO: move enum elsewhere
	None = 'PARTICLE_PIN_NONE',
	DistanceNeighbor = 'PARTICLE_PIN_DISTANCE_NEIGHBOR',
	Farthest = 'PARTICLE_PIN_DISTANCE_FARTHEST',
	First = 'PARTICLE_PIN_DISTANCE_FIRST',
	Last = 'PARTICLE_PIN_DISTANCE_LAST',
	CpPair = 'PARTICLE_PIN_DISTANCE_CP_PAIR_EITHER',//???
	Speed = 'PARTICLE_PIN_SPEED',
	Age = 'PARTICLE_PIN_COLLECTION_AGE',
	FloatValue = 'PARTICLE_PIN_FLOAT_VALUE',
}

export function stringToPinBreakType(breakType: string | null): Source2PinBreakType | undefined {//TODO: improve ?
	switch (breakType) {
		case Source2PinBreakType.None:
			return Source2PinBreakType.None;
		case Source2PinBreakType.DistanceNeighbor:
			return Source2PinBreakType.DistanceNeighbor;
		case Source2PinBreakType.Farthest:
			return Source2PinBreakType.Farthest;
		case Source2PinBreakType.First:
			return Source2PinBreakType.First;
		case Source2PinBreakType.Last:
			return Source2PinBreakType.Last;
		case Source2PinBreakType.CpPair:
			return Source2PinBreakType.CpPair;
		case Source2PinBreakType.Speed:
			return Source2PinBreakType.Speed;
		case Source2PinBreakType.Age:
			return Source2PinBreakType.Age;
		case Source2PinBreakType.FloatValue:
			return Source2PinBreakType.FloatValue;
		default:
			console.error('unsupported pin break type', breakType);
	}
}

export enum Source2ParticleTintBlendMode {//TODO: move enum elsewhere
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
