import { vec3 } from 'gl-matrix';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const center = vec3.create();

export class SetControlPointToCenter extends Operator {
	#cp1 = 1;
	#cp1Pos = vec3.create();

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nCP1':// TODO: mutualize thsi parameter ?
				this.#cp1 = param.getValueAsNumber() ?? 0;
				break;
			case 'm_vecCP1Pos':
				console.error('do this param', paramName, param);
				vec3.copy(this.#cp1Pos, param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		this.system.getBoundsCenter(center);
		vec3.add(center, center, this.#cp1Pos);
		this.system.getOwnControlPoint(this.#cp1).position = center;
	}

	isPreEmission() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_OP_SetControlPointToCenter', SetControlPointToCenter);
