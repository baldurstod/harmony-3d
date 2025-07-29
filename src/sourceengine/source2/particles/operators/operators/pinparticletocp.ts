import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export enum Source2ParticleSelection {//TODO: move enum elsewhere
	First = 'PARTICLE_SELECTION_FIRST',
	Last = 'PARTICLE_SELECTION_LAST',
	Number = 'PARTICLE_SELECTION_NUMBER',
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

const DEFAULT_OFFSET_LOCAL = true;// TODO: check default value
const DEFAULT_PARTICLE_SELECTION = Source2ParticleSelection.First;// TODO: check default value
const DEFAULT_PIN_BREAK = Source2PinBreakType.None;// TODO: check default value
const DEFAULT_BREAK_CP_NUMBER = -1;// TODO: check default value

export class PinParticleToCP extends Operator {
	#offsetLocal = DEFAULT_OFFSET_LOCAL;
	#particleSelection = DEFAULT_PARTICLE_SELECTION;//PARTICLE_SELECTION_LAST
	#pinBreakType = DEFAULT_PIN_BREAK;//PARTICLE_PIN_DISTANCE_NEIGHBOR
	#breakControlPointNumber = DEFAULT_BREAK_CP_NUMBER;
	#breakControlPointNumber2 = DEFAULT_BREAK_CP_NUMBER;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_vecOffset':
			case 'm_nParticleNumber':
			case 'm_flBreakDistance':
			case 'm_flBreakSpeed':
			case 'm_flAge':
				break;
			case 'm_bOffsetLocal':
				this.#offsetLocal = param.getValueAsBool() ?? DEFAULT_OFFSET_LOCAL;
				break;
			case 'm_nParticleSelection':
				this.#particleSelection = stringToParticleSelection(param.getValueAsString()) ?? DEFAULT_PARTICLE_SELECTION;
				break;
			case 'm_nPinBreakType':
				this.#pinBreakType = stringToPinBreakType(param.getValueAsString()) ?? DEFAULT_PIN_BREAK;
				break;
			case 'm_nBreakControlPointNumber':
				this.#breakControlPointNumber = param.getValueAsNumber() ?? DEFAULT_BREAK_CP_NUMBER;
				break;
			case 'm_nBreakControlPointNumber2':
				this.#breakControlPointNumber2 = param.getValueAsNumber() ?? DEFAULT_BREAK_CP_NUMBER;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle | null | Source2Particle[], elapsedTime: number, strength: number): void {
		//m_nParticleNumber
		//TODO
		console.error('code me');
	}
}
RegisterSource2ParticleOperator('C_OP_PinParticleToCP', PinParticleToCP);
