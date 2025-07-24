import { OperatorParam } from '../operatorparam';

const DEFAULT_BULGE_CONTROL = 0;// TODO: check default value
const DEFAULT_BULGE = 0;// TODO: check default value
const DEFAULT_START_CONTROL_POINT_NUMBER = 0;// TODO: check default value
const DEFAULT_END_CONTROL_POINT_NUMBER = 1;// TODO: check default value

export class Source2ParticlePathParams {
	#bulgeControl = DEFAULT_BULGE_CONTROL;
	#bulge = DEFAULT_BULGE;
	#startControlPointNumber = DEFAULT_START_CONTROL_POINT_NUMBER;
	#endControlPointNumber = DEFAULT_END_CONTROL_POINT_NUMBER;

	static fromOperatorParam(param: OperatorParam, path: Source2ParticlePathParams): void {
		path.#bulge = param.getSubValueAsNumber('m_flBulge') ?? DEFAULT_BULGE;
		path.#bulgeControl = param.getSubValueAsNumber('m_nBulgeControl') ?? DEFAULT_BULGE_CONTROL;
		path.#startControlPointNumber = param.getSubValueAsNumber('m_nEndControlPointNumber') ?? DEFAULT_START_CONTROL_POINT_NUMBER;
		path.#endControlPointNumber = param.getSubValueAsNumber('m_nEndControlPointNumber') ?? DEFAULT_END_CONTROL_POINT_NUMBER;
		// TODO: check if there are other params
	}
};
