import { quat, vec3, vec4 } from 'gl-matrix';
import { vec3RandomBox } from '../../../../../math/functions';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Source2ParticleRandomParams } from '../utils/randomparams';

const tempQuat = quat.create();
const tempVec3 = vec3.create();
const tempVec3_2 = vec3.create();

const DEFAULT_LOCAl_SPACE = false;
const DEFAULT_USE_NEW_CODE = false;

export class CreateWithinBox extends Operator {
	#vecMin = vec4.create();
	#vecMax = vec4.create();
	#localSpace = DEFAULT_LOCAl_SPACE;
	#randomParams = new Source2ParticleRandomParams();
	#useNewCode = DEFAULT_USE_NEW_CODE;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_bLocalSpace':
				this.#localSpace = param.getValueAsBool() ?? DEFAULT_LOCAl_SPACE;
				break;
			case 'm_randomnessParameters':
				Source2ParticleRandomParams.fromOperatorParam(param, this.#randomParams);
				break;
			case 'm_bUseNewCode':
				this.#useNewCode = param.getValueAsBool() ?? DEFAULT_USE_NEW_CODE;
				break;
			case 'm_vecMin':
			case 'm_vecMax':
				// used in doInit
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle: Source2Particle): void {
		//TODO: useNewCode ??
		this.getParamVectorValue(this.#vecMin, 'm_vecMin', particle);
		this.getParamVectorValue(this.#vecMax, 'm_vecMax', particle);
		vec3RandomBox(tempVec3, this.#vecMin as vec3, this.#vecMax as vec3);
		/*
		if (this.#scaleCP !== -1) {
			const scaleCp = this.system.getControlPointForScale(this.#scaleCP);
			if (scaleCp) {
				scaleCp.getWorldPosition(tempVec3_2);
				vec3.scale(tempVec3, tempVec3, tempVec3_2[0]);//x position of the scale cp is used as scaling
			}
		}
			*/

		const controlPoint = this.system.getControlPoint(this.controlPointNumber);
		if (controlPoint) {
			controlPoint.getWorldPosition(tempVec3_2);
			if (this.#localSpace) {
				vec3.transformQuat(tempVec3, tempVec3, controlPoint.getWorldQuaternion(tempQuat));
				vec3.add(tempVec3, tempVec3, tempVec3_2);
			} else {
				vec3.add(tempVec3, tempVec3, tempVec3_2);
			}
		}
		vec3.copy(particle.position, tempVec3);
		vec3.copy(particle.prevPosition, tempVec3);
	}
}
RegisterSource2ParticleOperator('C_INIT_CreateWithinBox', CreateWithinBox);
