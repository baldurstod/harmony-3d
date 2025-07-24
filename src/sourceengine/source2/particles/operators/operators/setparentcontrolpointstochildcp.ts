import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_SET_ORIENTATION = false;
const DEFAULT_NUM_CONTROL_POINTS = 1;
const DEFAULT_FIRST_SOURCE_CONTROL_POINT= 0;

export class SetParentControlPointsToChildCP extends Operator {
	#childGroupID = 0;
	#childControlPoint = 0;
	#numControlPoints = DEFAULT_NUM_CONTROL_POINTS;
	#firstSourcePoint = DEFAULT_FIRST_SOURCE_CONTROL_POINT;
	#setOrientation = DEFAULT_SET_ORIENTATION;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nChildGroupID':
				console.error('do this param', paramName, param);
				this.#childGroupID = (param);
				break;
			case 'm_nChildControlPoint':
				console.error('do this param', paramName, param);
				this.#childControlPoint = (param);
				break;
			case 'm_nNumControlPoints':
				this.#numControlPoints = param.getValueAsNumber() ?? DEFAULT_NUM_CONTROL_POINTS;
				break;
			case 'm_nFirstSourcePoint':
				this.#firstSourcePoint = param.getValueAsNumber() ?? DEFAULT_FIRST_SOURCE_CONTROL_POINT;
				break;
			case 'm_bSetOrientation':
				this.#setOrientation = param.getValueAsBool() ?? DEFAULT_SET_ORIENTATION;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		// TODO: use setOrientation
		const children = this.system.childSystems;
		let childId = this.#childGroupID;
		let cpId = this.#firstSourcePoint;
		let count = this.#numControlPoints;
		while (count--) {
			const child = children[childId];
			const cp = this.system.getControlPoint(cpId);
			if (child && cp) {
				const childCp = child.getOwnControlPoint(this.#childControlPoint);
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
