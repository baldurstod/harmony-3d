import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

export class SetParentControlPointsToChildCP extends Operator {
	childGroupID = 0;
	childControlPoint = 0;
	numControlPoints = 1;
	firstSourcePoint = 0;
	setOrientation = false;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nChildGroupID':
				this.childGroupID = Number(value);
				break;
			case 'm_nChildControlPoint':
				this.childControlPoint = Number(value);
				break;
			case 'm_nNumControlPoints':
				this.numControlPoints = Number(value);
				break;
			case 'm_nFirstSourcePoint':
				this.firstSourcePoint = Number(value);
				break;
			case 'm_bSetOrientation':
				this.setOrientation = value;
				break;
			default:
				super._paramChanged(paramName, value);
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
