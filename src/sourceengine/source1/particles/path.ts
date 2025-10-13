import { vec3 } from 'gl-matrix';
import { float, int, uint } from 'harmony-types';

export type PathParameters = {
	startControlPointNumber: uint;
	endControlPointNumber: uint;
	bulgeControl: BulgeControl;
	bulge: float;
	midPoint: float;
}

export enum BulgeControl {
	Random = 0,
	OrientationOfStartPoint = 1,
	OrientationOfEndPoint = 2,
}
