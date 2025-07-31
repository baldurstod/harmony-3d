import { Source2ParticleTransformType, stringToTransformType } from '../../enums';
import { OperatorParam } from '../operatorparam';

const DEFAULT_CONTROL_POINT = 0;
const DEFAULT_TYPE = Source2ParticleTransformType.ControlPoint;

export class Source2ParticleTransformInput {
	type = DEFAULT_TYPE;
	controlPoint = DEFAULT_CONTROL_POINT;

	static fromOperatorParam(param: OperatorParam, input: Source2ParticleTransformInput): void {
		input.type = stringToTransformType(param.getSubValueAsString('m_nType')) ?? DEFAULT_TYPE;
		input.controlPoint = param.getSubValueAsNumber('m_nControlPoint') ?? DEFAULT_CONTROL_POINT;
		// TODO: other params
	}
};
