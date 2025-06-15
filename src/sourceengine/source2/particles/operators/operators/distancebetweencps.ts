import { vec3 } from 'gl-matrix';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator } from '../operator';
import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { RemapValClamped } from '../../../../../math/functions';

export class DistanceBetweenCPs extends Operator {
	fieldOutput = PARTICLE_FIELD_RADIUS;
	startCP = 0;
	endCP = 1;
	maxTraceLength = -1;
	losScale = 0;
	collisionGroupName = 'NONE';
	los = false;
	setMethod = null;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_nStartCP':
				this.startCP = Number(value);
				break;
			case 'm_nEndCP':
				this.endCP = Number(value);
				break;
			case 'm_flInputMin':
			case 'm_flInputMax':
			case 'm_flOutputMin':
			case 'm_flOutputMax':
				break;
			case 'm_flMaxTraceLength':
				this.maxTraceLength = value;
				break;
			case 'm_flLOSScale':
				this.losScale = value;
				break;
			case 'm_CollisionGroupName':
				this.collisionGroupName = value;
				break;
			case 'm_bLOS':
				this.los = value;
				break;
			case 'm_nSetMethod':
				this.setMethod = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle, elapsedTime) {
		const inputMin = this.getParamScalarValue('m_flInputMin') ?? 0;
		const inputMax = this.getParamScalarValue('m_flInputMax') ?? 128;
		const outputMin = this.getParamScalarValue('m_flOutputMin') ?? 0;
		const outputMax = this.getParamScalarValue('m_flOutputMax') ?? 1;

		//TODO: los and other parameters

		const startCpPos = this.system.getControlPoint(this.startCP).currentWorldPosition;
		const endCPPos = this.system.getControlPoint(this.endCP).currentWorldPosition;

		let value = vec3.distance(startCpPos, endCPPos);

		value = RemapValClamped(value, inputMin, inputMax, outputMin, outputMax);
		particle.setField(this.fieldOutput, value, this.setMethod == 'PARTICLE_SET_SCALE_INITIAL_VALUE');
	}
}
RegisterSource2ParticleOperator('C_OP_DistanceBetweenCPs', DistanceBetweenCPs);
