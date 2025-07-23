import { quat, vec3 } from 'gl-matrix';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const q = quat.create();

export class SetControlPointOrientation extends Operator {
	useWorldLocation = false;
	randomize = false;
	setOnce = false;
	cp = 1;
	headLocation = 0;
	rotation = vec3.create();
	rotationB = vec3.create();

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flInterpolation':
				break;
			case 'm_bUseWorldLocation':
				this.useWorldLocation = param;
				break;
			case 'm_bRandomize':
				this.randomize = param;
				break;
			case 'm_bSetOnce':
				this.setOnce = param;
				break;
			case 'm_nCP':
				this.cp = (param);
				break;
			case 'm_nHeadLocation':
				this.headLocation = (param);
				break;
			case 'm_vecRotation':
				vec3.copy(this.rotation, param);
				break;
			case 'm_vecRotationB':
				vec3.copy(this.rotationB, param);
				break;

			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle, elapsedTime) {
		return;
		//TODO: randomize parameter + interpolation
		const cp = this.system.getControlPoint(this.cp);
		if (cp) {
			const rotation = this.rotation;

			quat.fromEuler(q, rotation[2], rotation[0], rotation[1]);//order is pitch yaw roll
			quat.fromEuler(q, rotation[1], rotation[0], rotation[2]);//order is pitch yaw roll
			if (!this.useWorldLocation) {
				const headControlPoint = this.system.getControlPoint(this.headLocation);
				if (headControlPoint) {
					quat.mul(q, q, headControlPoint.currentWorldQuaternion);
				}
			}
			//TODO: dafuck ?
			quat.invert(q, q);
			cp.quaternion = q;
			//cp._compute();
		}
	}

	isPreEmission() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_OP_SetControlPointOrientation', SetControlPointOrientation);
