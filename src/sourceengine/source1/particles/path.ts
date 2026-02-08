import { float32, uint } from 'harmony-types';

export type PathParameters = {
	startControlPointNumber: uint;
	endControlPointNumber: uint;
	bulgeControl: BulgeControl;
	bulge: float32;
	midPoint: float32;
}

export enum BulgeControl {
	Random = 0,
	OrientationOfStartPoint = 1,
	OrientationOfEndPoint = 2,
}
