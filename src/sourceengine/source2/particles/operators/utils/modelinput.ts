import { Source2ParticleModelType, stringToModelType } from '../../enums';
import { OperatorParam } from '../operatorparam';

const DEFAULT_CONTROL_POINT = 0;
const DEFAULT_TYPE = Source2ParticleModelType.ControlPoint;
const DEFAULT_USE_ORIENTATION = true;

export class Source2ParticleModelInput {
	type = DEFAULT_TYPE;
	controlPoint = DEFAULT_CONTROL_POINT;
	useOrientation = DEFAULT_USE_ORIENTATION;

	static fromOperatorParam(param: OperatorParam, input: Source2ParticleModelInput): void {
		input.type = stringToModelType(param.getSubValueAsString('m_nType')) ?? DEFAULT_TYPE;
		input.controlPoint = param.getSubValueAsNumber('m_nControlPoint') ?? DEFAULT_CONTROL_POINT;
		input.useOrientation = param.getSubValueAsBool('m_bUseOrientation') ?? DEFAULT_USE_ORIENTATION;
		// TODO: add model / entity params
	}
};
