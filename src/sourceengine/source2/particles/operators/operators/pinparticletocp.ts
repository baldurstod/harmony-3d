import { Source2ParticleSelection, Source2PinBreakType, stringToParticleSelection, stringToPinBreakType } from '../../enums';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';


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
