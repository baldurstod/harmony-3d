import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class SetParentControlPointsToChildCP extends Operator {
	childGroupID = 0;
	childControlPoint = 0;
	numControlPoints = 1;
	firstSourcePoint = 0;
	setOrientation = false;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nChildGroupID':
				this.childGroupID = (param);
				break;
			case 'm_nChildControlPoint':
				this.childControlPoint = (param);
				break;
			case 'm_nNumControlPoints':
				this.numControlPoints = (param);
				break;
			case 'm_nFirstSourcePoint':
				this.firstSourcePoint = (param);
				break;
			case 'm_bSetOrientation':
				this.setOrientation = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime) {
		const children = this.system.childSystems;
		let childId = this.childGroupID;
		let cpId = this.firstSourcePoint;
		let count = this.numControlPoints;
		while (count--) {
			const child = children[childId];
			const cp = this.system.getControlPoint(cpId);
			if (child && cp) {
				const childCp = child.getOwnControlPoint(this.childControlPoint);
				childCp.position = cp.currentWorldPosition;
			}
			++childId;
			++cpId;
		}
	}

	isPreEmission() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_OP_SetParentControlPointsToChildCP', SetParentControlPointsToChildCP);
