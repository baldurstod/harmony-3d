import { vec3, vec4 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_POSITION = vec3.fromValues(128, 0, 0);
const v = vec3.create();
const tempVec4 = vec4.create();

const DEFAULT_CP_1 = 1;// TODO: check default value
const DEFAULT_USE_WORLD_POSITION = false;// TODO: check default value
const DEFAULT_SET_ONCE = false;// TODO: check default value

export class SetSingleControlPointPosition extends Operator {
	#useWorldLocation = DEFAULT_USE_WORLD_POSITION;
	#setOnce = DEFAULT_SET_ONCE;
	#cp1 = DEFAULT_CP_1;
	#headLocation = 0;
	#set = false;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_vecCP1Pos':
				//used in doOperate
				break;
			case 'm_bUseWorldLocation':
				this.#useWorldLocation = param.getValueAsBool() ?? DEFAULT_USE_WORLD_POSITION;
				break;
			case 'm_bSetOnce':// TODO: mutualize
				this.#setOnce = param.getValueAsBool() ?? DEFAULT_SET_ONCE;
				break;
			case 'm_nCP1':
				this.#cp1 = param.getValueAsNumber() ?? DEFAULT_CP_1;
				break;
			case 'm_nHeadLocation':
				console.error('do this param', paramName, param);
				this.#headLocation = (param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	reset() {
		this.#set = false;
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const cp1Pos = this.getParamVectorValue(tempVec4, 'm_vecCP1Pos', particle) ?? DEFAULT_POSITION;
		//TODO
		if (!this.#setOnce || !this.#set) {
			const cp = this.system.getOwnControlPoint(this.#cp1);
			if (this.#useWorldLocation) {
				cp.setPosition(cp1Pos as vec3);
			} else {
				const headCp = this.system.getControlPoint(this.#headLocation);
				vec3.transformQuat(v, cp1Pos as vec3, headCp.currentWorldQuaternion);
				vec3.add(v, v, headCp.currentWorldPosition);
				cp.position = v;
			}
			this.#set = true;
		}
	}

	isPreEmission() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_OP_SetSingleControlPointPosition', SetSingleControlPointPosition);
