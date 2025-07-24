import { vec3, vec4 } from 'gl-matrix';
import { vec3RandomBox } from '../../../../../math/functions';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const DEFAULT_OFFSET = vec3.create();
const DEFAULT_LOCAL_COORDS = false;
const DEFAULT_PROPORTIONAL = false;

const offset = vec3.create();

export class PositionOffset extends Operator {
	#localCoords = DEFAULT_LOCAL_COORDS;
	#proportional = DEFAULT_PROPORTIONAL;
	#offsetMin = vec4.create();
	#offsetMax = vec4.create();

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_OffsetMin':
			case 'm_OffsetMax':
				// used in doInit
				break;
			case 'm_bLocalCoords':
				this.#localCoords = param.getValueAsBool() ?? DEFAULT_LOCAL_COORDS;
				break;
			case 'm_bProportional'://TODO: mutualize ?
				this.#proportional = param.getValueAsBool() ?? DEFAULT_PROPORTIONAL;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doInit(particle: Source2Particle, elapsedTime: number, strength: number): void {
		// TODO: use m_bProportional
		const offsetMin = this.getParamVectorValue('m_OffsetMin', particle, this.#offsetMin) ?? DEFAULT_OFFSET;
		const offsetMax = this.getParamVectorValue('m_OffsetMax', particle, this.#offsetMax) ?? DEFAULT_OFFSET;

		vec3RandomBox(offset, offsetMin as vec3, offsetMax as vec3);

		if (this.#localCoords) {

			const cp = particle.system.getControlPoint(this.controlPointNumber);
			if (cp) {
				vec3.transformQuat(offset, offset, cp.getWorldQuaternion());
			}
		}
		vec3.add(particle.position, particle.position, offset);
		vec3.add(particle.prevPosition, particle.prevPosition, offset);
	}

	initMultipleOverride() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_INIT_PositionOffset', PositionOffset);
