import { Source2ParticleSelection, Source2PinBreakType, stringToParticleSelection, stringToPinBreakType } from '../../enums';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';


const DEFAULT_PIN_BREAK = Source2PinBreakType.None;
const DEFAULT_OFFSET_LOCAL = false;
const DEFAULT_PARTICLE_SELECTION = Source2ParticleSelection.First;
const DEFAULT_BREAK_CP_NUMBER = -1;
const DEFAULT_RETAIN_INITIAL_VELOCITY = false;

export class PinParticleToCP extends Operator {
	static doOnce = false;
	#offsetLocal = DEFAULT_OFFSET_LOCAL;
	#particleSelection = DEFAULT_PARTICLE_SELECTION;//PARTICLE_SELECTION_LAST
	#pinBreakType = DEFAULT_PIN_BREAK;//PARTICLE_PIN_DISTANCE_NEIGHBOR
	#breakControlPointNumber = DEFAULT_BREAK_CP_NUMBER;
	#breakControlPointNumber2 = DEFAULT_BREAK_CP_NUMBER;
	#retainInitialVelocity = DEFAULT_RETAIN_INITIAL_VELOCITY;
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
	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nPinBreakType':
				this.#pinBreakType = stringToPinBreakType(param.getValueAsString()) ?? DEFAULT_PIN_BREAK;
				break;
			case 'm_bOffsetLocal':
				this.#offsetLocal = param.getValueAsBool() ?? DEFAULT_OFFSET_LOCAL;
				break;
			case 'm_nParticleSelection':
				this.#particleSelection = stringToParticleSelection(param.getValueAsString()) ?? DEFAULT_PARTICLE_SELECTION;
				break;
			case 'm_nBreakControlPointNumber':
				this.#breakControlPointNumber = param.getValueAsNumber() ?? DEFAULT_BREAK_CP_NUMBER;
				break;
			case 'm_nBreakControlPointNumber2':
				this.#breakControlPointNumber2 = param.getValueAsNumber() ?? DEFAULT_BREAK_CP_NUMBER;
				break;
			case 'm_bRetainInitialVelocity':
				this.#retainInitialVelocity = param.getValueAsBool() ?? DEFAULT_RETAIN_INITIAL_VELOCITY;
				break;
			case 'm_vecOffset':
			case 'm_nParticleNumber':
			case 'm_flBreakDistance':
			case 'm_flBreakSpeed':
			case 'm_flAge':
			case 'm_flBreakValue':
			case 'm_flInterpolation':
				// used in doOperate
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
