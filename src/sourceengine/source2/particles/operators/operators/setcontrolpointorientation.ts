import { quat, vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

let q = quat.create();

export class SetControlPointOrientation extends Operator {
	useWorldLocation = false;
	randomize = false;
	setOnce = false;
	cp = 1;
	headLocation = 0;
	rotation = vec3.create();
	rotationB = vec3.create();

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_flInterpolation':
				break;
			case 'm_bUseWorldLocation':
				this.useWorldLocation = value;
				break;
			case 'm_bRandomize':
				this.randomize = value;
				break;
			case 'm_bSetOnce':
				this.setOnce = value;
				break;
			case 'm_nCP':
				this.cp = Number(value);
				break;
			case 'm_nHeadLocation':
				this.headLocation = Number(value);
				break;
			case 'm_vecRotation':
				vec3.copy(this.rotation, value);
				break;
			case 'm_vecRotationB':
				vec3.copy(this.rotationB, value);
				break;

			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		return;
		//TODO: randomize parameter + interpolation
		let cp = this.system.getControlPoint(this.cp);
		if (cp) {
			let rotation = this.rotation;

			quat.fromEuler(q, rotation[2], rotation[0], rotation[1]);//order is pitch yaw roll
			quat.fromEuler(q, rotation[1], rotation[0], rotation[2]);//order is pitch yaw roll
			if (!this.useWorldLocation) {
				let headControlPoint = this.system.getControlPoint(this.headLocation);
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
