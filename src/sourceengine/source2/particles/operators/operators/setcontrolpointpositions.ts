import { vec3 } from 'gl-matrix';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const v = vec3.create();


const DEFAULT_USE_WORLD_LOCATION = false;// TODO: check default value
const DEFAULT_ORIENT = false;// TODO: check default value
const DEFAULT_CP_1 = 1;// TODO: check default value
const DEFAULT_CP_2 = 2;// TODO: check default value
const DEFAULT_CP_3 = 3;// TODO: check default value
const DEFAULT_CP_4 = 4;// TODO: check default value
const DEFAULT_HEAD_LOCATION = 0;// TODO: check default value
const DEFAULT_SET_ONCE = false;// TODO: check default value

export class SetControlPointPositions extends Operator {
	#useWorldLocation = DEFAULT_USE_WORLD_LOCATION;
	#orient = DEFAULT_ORIENT;
	#cp = [DEFAULT_CP_1, DEFAULT_CP_2, DEFAULT_CP_3, DEFAULT_CP_4];
	#cpPos: [vec3, vec3, vec3, vec3] = [vec3.fromValues(128, 0, 0), vec3.fromValues(0, 128, 0), vec3.fromValues(-128, 0, 0), vec3.fromValues(0, -128, 0)];// TODO: check default value
	#headLocation = DEFAULT_HEAD_LOCATION;
	#setOnce: boolean = DEFAULT_SET_ONCE;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_bUseWorldLocation':// TODO: mutualize
				this.#useWorldLocation = param.getValueAsBool() ?? DEFAULT_USE_WORLD_LOCATION;
				break;
			case 'm_bOrient':
				this.#orient = param.getValueAsBool() ?? DEFAULT_ORIENT;
				break;
			case 'm_bSetOnce':
				this.#setOnce = param.getValueAsBool() ?? DEFAULT_SET_ONCE;
				break;
			case 'm_nCP1':
				this.#cp[0] = param.getValueAsNumber() ?? DEFAULT_CP_1;
				break;
			case 'm_nCP2':
				this.#cp[1] = param.getValueAsNumber() ?? DEFAULT_CP_2;
				break;
			case 'm_nCP3':
				this.#cp[2] = param.getValueAsNumber() ?? DEFAULT_CP_3;
				break;
			case 'm_nCP4':
				this.#cp[3] = param.getValueAsNumber() ?? DEFAULT_CP_4;
				break;
			case 'm_vecCP1Pos':
				param.getValueAsVec3(this.#cpPos[0]);
				break;
			case 'm_vecCP2Pos':
				param.getValueAsVec3(this.#cpPos[1]);
				break;
			case 'm_vecCP3Pos':
				param.getValueAsVec3(this.#cpPos[2]);
				break;
			case 'm_vecCP4Pos':
				param.getValueAsVec3(this.#cpPos[3]);
				break;
			case 'm_nHeadLocation':
				this.#headLocation = param.getValueAsNumber() ?? DEFAULT_HEAD_LOCATION;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(): void {
		// TODO: use orient
		//const list = ['First', 'Second', 'Third', 'Fourth'];

		const useWorldLocation = this.#useWorldLocation;

		//const vecControlPoint = this.system.getControlPointPosition(this.#headLocation);

		let cpNumber;
		let cpLocation;

		const headLocation = this.system.getControlPoint(this.#headLocation);

		for (let cpIndex = 0; cpIndex < 4; ++cpIndex) {
			cpNumber = this.#cp[cpIndex]!;
			cpLocation = this.#cpPos[cpIndex]!;

			const cp = this.system.getControlPoint(cpNumber);
			if (!useWorldLocation) {
				vec3.transformQuat(v, cpLocation, headLocation.currentWorldQuaternion);
				vec3.add(v, v, headLocation.currentWorldPosition);
				cp.setPosition(v);
			} else {
				cp.setPosition(cpLocation);
				this.system.setControlPointPosition(cpNumber, cpLocation);
			}
		}
	}

	override isPreEmission(): boolean {
		return true;
	}
}
RegisterSource2ParticleOperator('C_OP_SetControlPointPositions', SetControlPointPositions);
