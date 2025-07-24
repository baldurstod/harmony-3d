import { quat, vec3 } from 'gl-matrix';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2Particle } from '../../source2particle';

const q = quat.create();

const DEFAULT_CP = 1;// TODO: check default value
const DEFAULT_USE_WORLD_LOCATION = false;// TODO: check default value

export class SetControlPointOrientation extends Operator {
	#useWorldLocation = DEFAULT_USE_WORLD_LOCATION;
	#randomize = false;
	#setOnce = false;
	#cp = DEFAULT_CP;
	#headLocation = 0;
	#rotation = vec3.create();
	#rotationB = vec3.create();

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flInterpolation':
				console.error('do this param', paramName, param);
				break;
			case 'm_bUseWorldLocation':
				this.#useWorldLocation = param.getValueAsBool() ?? DEFAULT_USE_WORLD_LOCATION;
				break;
			case 'm_bRandomize':
				console.error('do this param', paramName, param);
				this.#randomize = param;
				break;
			case 'm_bSetOnce':
				console.error('do this param', paramName, param);
				this.#setOnce = param;
				break;
			case 'm_nCP'://TODO: mutualize
				this.#cp = param.getValueAsNumber() ?? DEFAULT_CP;
				break;
			case 'm_nHeadLocation':
				console.error('do this param', paramName, param);
				this.#headLocation = (param);
				break;
			case 'm_vecRotation':
				console.error('do this param', paramName, param);
				vec3.copy(this.#rotation, param);
				break;
			case 'm_vecRotationB':
				console.error('do this param', paramName, param);
				vec3.copy(this.#rotationB, param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle , elapsedTime: number, strength: number): void {
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
			cp.quaternion = q;
			//cp._compute();
		}
	}

	isPreEmission() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_OP_SetControlPointOrientation', SetControlPointOrientation);
