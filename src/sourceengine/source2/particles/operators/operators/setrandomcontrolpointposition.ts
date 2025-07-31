import { vec3 } from 'gl-matrix';
import { vec3RandomBox } from '../../../../../math/functions';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2Particle } from '../../source2particle';

const v = vec3.create();

const DEFAULT_USE_WORLD_LOCATION = false;// TODO: check default value
const DEFAULT_ORIENT = false;// TODO: check default value
const DEFAULT_CP1 = 1;// TODO: check default value
const DEFAULT_HEAD_LOCATION = 0;// TODO: check default value

export class SetRandomControlPointPosition extends Operator {//TODO: disable ? not usable in dote tools
	#useWorldLocation = DEFAULT_USE_WORLD_LOCATION;
	#orient = DEFAULT_ORIENT;
	#cp1 = 1;
	#headLocation = DEFAULT_HEAD_LOCATION;
	cpMinPos = vec3.create();// TODO: check default value
	cpMaxPos = vec3.create();// TODO: check default value
	lastRandomTime = -1;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_bUseWorldLocation':
				this.#useWorldLocation = param.getValueAsBool() ?? DEFAULT_USE_WORLD_LOCATION;
				break;
			case 'm_bOrient':
				this.#orient = param.getValueAsBool() ?? DEFAULT_ORIENT;
				break;
			case 'm_nCP1':
				this.#cp1 = param.getValueAsNumber() ?? DEFAULT_CP1;
				break;
			case 'm_nHeadLocation':
				this.#headLocation = param.getValueAsNumber() ?? DEFAULT_HEAD_LOCATION;
				break;
			case 'm_vecCPMinPos':
				param.getValueAsVec3(this.cpMinPos);
				break;
			case 'm_vecCPMaxPos':
				param.getValueAsVec3(this.cpMaxPos);
				break;
			case 'm_flReRandomRate':
			case 'm_flInterpolation':
				//used in doOperate
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const reRandomRate = this.getParamScalarValue('m_flReRandomRate') ?? -1;// TODO: check default value
		const interpolation = this.getParamScalarValue('m_flInterpolation') ?? 1;// TODO: check default value

		//TODO: do interpolation
		if ((reRandomRate >= 0 || this.lastRandomTime < 0) && (this.system.currentTime - this.lastRandomTime > reRandomRate)) {
			this.lastRandomTime = this.system.currentTime;

			vec3RandomBox(v, this.cpMinPos, this.cpMaxPos);

			const headLocation = this.system.getControlPoint(this.#headLocation);
			const cp1 = this.system.getControlPoint(this.#cp1);
			vec3.transformQuat(v, v, headLocation.currentWorldQuaternion);
			vec3.add(v, v, headLocation.currentWorldPosition);
			cp1.position = v;

			if (this.#orient) {
				cp1.setWorldQuaternion(headLocation.currentWorldQuaternion);
			}
		}
	}

	isPreEmission() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_OP_SetRandomControlPointPosition', SetRandomControlPointPosition);
