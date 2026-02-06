import { quat, vec3 } from 'gl-matrix';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const q = quat.create();

const DEFAULT_CP = 1;// TODO: check default value
const DEFAULT_USE_WORLD_LOCATION = false;// TODO: check default value
const DEFAULT_HEAD_LOCATION = 0;// TODO: check default value


// TODO: check if disabled ?
export class SetControlPointOrientation extends Operator {
	#useWorldLocation = DEFAULT_USE_WORLD_LOCATION;
	#randomize = false;// TODO: check default value
	#setOnce = false;// TODO: check default value
	#cp = DEFAULT_CP;
	#headLocation = DEFAULT_HEAD_LOCATION;
	#rotation = vec3.create();// TODO: check default value
	#rotationB = vec3.create();// TODO: check default value

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flInterpolation':
				console.error('do this param', paramName, param);
				break;
			case 'm_bUseWorldLocation':
				this.#useWorldLocation = param.getValueAsBool() ?? DEFAULT_USE_WORLD_LOCATION;
				break;
			case 'm_bRandomize':
				console.error('do this param', paramName, param);
				this.#randomize = param.getValueAsBool() ?? false;// TODO: check default value
				break;
			case 'm_bSetOnce':
				console.error('do this param', paramName, param);
				this.#setOnce = param.getValueAsBool() ?? false;// TODO: check default value
				break;
			case 'm_nCP'://TODO: mutualize
				this.#cp = param.getValueAsNumber() ?? DEFAULT_CP;
				break;
			case 'm_nHeadLocation':
				this.#headLocation = param.getValueAsNumber() ?? DEFAULT_HEAD_LOCATION;
				break;
			case 'm_vecRotation':
				param.getValueAsVec3(this.#rotation);
				break;
			case 'm_vecRotationB':
				param.getValueAsVec3(this.#rotationB);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(): void {
		return;
		//TODO: randomize parameter + interpolation
		const cp = this.system.getControlPoint(this.#cp);
		if (cp) {
			const rotation = this.#rotation;

			quat.fromEuler(q, rotation[2], rotation[0], rotation[1]);//order is pitch yaw roll
			quat.fromEuler(q, rotation[1], rotation[0], rotation[2]);//order is pitch yaw roll
			if (!this.#useWorldLocation) {
				const headControlPoint = this.system.getControlPoint(this.#headLocation);
				if (headControlPoint) {
					quat.mul(q, q, headControlPoint.currentWorldQuaternion);
				}
			}
			//TODO: dafuck ?
			quat.invert(q, q);
			cp.setQuaternion(q);
			//cp._compute();
		}
	}

	override isPreEmission(): boolean {
		return true;
	}
}
RegisterSource2ParticleOperator('C_OP_SetControlPointOrientation', SetControlPointOrientation);
