import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';

const center = vec3.create();

export class SetControlPointToCenter extends Operator {
	cp1 = 1;
	cp1Pos = vec3.create();

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nCP1':
				this.cp1 = Number(value);
				break;
			case 'm_vecCP1Pos':
				vec3.copy(this.cp1Pos, value);
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		this.system.getBoundsCenter(center);
		vec3.add(center, center, this.cp1Pos);
		this.system.getOwnControlPoint(this.cp1).position = center;
	}

	isPreEmission() {
		return true;
	}
}
RegisterSource2ParticleOperator('C_OP_SetControlPointToCenter', SetControlPointToCenter);
