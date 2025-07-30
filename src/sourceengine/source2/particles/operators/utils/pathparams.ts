import { vec3 } from 'gl-matrix';
import { OperatorParam } from '../operatorparam';

const DEFAULT_BULGE_CONTROL = 0;
const DEFAULT_BULGE = 0;
const DEFAULT_START_CONTROL_POINT_NUMBER = 0;
const DEFAULT_END_CONTROL_POINT_NUMBER = 0;
const DEFAULT_MID_POINT = 0.5;

export class Source2ParticlePathParams {
	bulgeControl = DEFAULT_BULGE_CONTROL;
	bulge = DEFAULT_BULGE;
	startControlPointNumber = DEFAULT_START_CONTROL_POINT_NUMBER;
	endControlPointNumber = DEFAULT_END_CONTROL_POINT_NUMBER;
	midPoint = DEFAULT_MID_POINT;
	startPointOffset = vec3.create();
	midPointOffset = vec3.create();
	endOffset = vec3.create();

	static fromOperatorParam(param: OperatorParam, path: Source2ParticlePathParams): void {
		path.bulge = param.getSubValueAsNumber('m_flBulge') ?? DEFAULT_BULGE;
		path.bulgeControl = param.getSubValueAsNumber('m_nBulgeControl') ?? DEFAULT_BULGE_CONTROL;
		path.startControlPointNumber = param.getSubValueAsNumber('m_nStartControlPointNumber') ?? DEFAULT_START_CONTROL_POINT_NUMBER;
		path.endControlPointNumber = param.getSubValueAsNumber('m_nEndControlPointNumber') ?? DEFAULT_END_CONTROL_POINT_NUMBER;
		path.midPoint = param.getSubValueAsNumber('m_flMidPoint') ?? DEFAULT_MID_POINT;
		param.getSubValueAsVec3('m_vStartPointOffset', path.startPointOffset);
		param.getSubValueAsVec3('m_vMidPointOffset', path.midPointOffset);
		param.getSubValueAsVec3('m_vEndOffset', path.endOffset);
	}
};
