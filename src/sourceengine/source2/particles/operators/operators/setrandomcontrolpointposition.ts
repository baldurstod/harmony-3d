import { vec3 } from 'gl-matrix';
import { vec3RandomBox } from '../../../../../math/functions';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const v = vec3.create();

export class SetRandomControlPointPosition extends Operator {
	useWorldLocation = false;
	orient = false;
	cp1 = 1;
	headLocation = 0;
	cpMinPos = vec3.create();
	cpMaxPos = vec3.create();
	lastRandomTime = -1;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_bUseWorldLocation':
				this.useWorldLocation = param;
				break;
			case 'm_bOrient':
				this.orient = param;
				break;
			case 'm_nCP1':
				this.cp1 = (param);
				break;
			case 'm_nHeadLocation':
				this.headLocation = (param);
				break;
			case 'm_flReRandomRate':
			case 'm_flInterpolation':
				break;
			case 'm_vecCPMinPos':
				vec3.copy(this.cpMinPos, param);
				break;
			case 'm_vecCPMaxPos':
				vec3.copy(this.cpMaxPos, param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime) {
		const reRandomRate = this.getParamScalarValue('m_flReRandomRate') ?? -1;
		const interpolation = this.getParamScalarValue('m_flInterpolation') ?? 1;

		//TODO: do interpolation
		if ((reRandomRate >= 0 || this.lastRandomTime < 0) && (this.system.currentTime - this.lastRandomTime > reRandomRate)) {
			this.lastRandomTime = this.system.currentTime;

			vec3RandomBox(v, this.cpMinPos, this.cpMaxPos);

			const headLocation = this.system.getControlPoint(this.headLocation);
			const cp1 = this.system.getControlPoint(this.cp1);
			vec3.transformQuat(v, v, headLocation.currentWorldQuaternion);
			vec3.add(v, v, headLocation.currentWorldPosition);
			cp1.position = v;

			if (this.orient) {
				cp1.setWorldQuaternion(headLocation.currentWorldQuaternion);
			}
		}
	}

	isPreEmission() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_OP_SetRandomControlPointPosition', SetRandomControlPointPosition);
