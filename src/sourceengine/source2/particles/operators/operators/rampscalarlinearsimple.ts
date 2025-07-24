import { PARTICLE_FIELD_RADIUS } from '../../../../common/particles/particlefields';
import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class RampScalarLinearSimple extends Operator {
	#rate = 0;
	#startTime = 0;
	#endTime = 1;//TODO: check default value
	#field = PARTICLE_FIELD_RADIUS;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_Rate':
				this.#rate = param.getValueAsNumber() ?? 0;
				break;
			case 'm_flStartTime':
				this.#startTime = param.getValueAsNumber() ?? 0;
				break;
			case 'm_flEndTime':// TODO: mutualize param ?
				this.#endTime = param.getValueAsNumber() ?? 1;
				break;
			case 'm_nField':
				this.#field = param.getValueAsNumber() ?? PARTICLE_FIELD_RADIUS;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number, strength: number): void {
		const particleTime = particle.proportionOfLife;
		if (particleTime < this.#startTime || particleTime > this.#endTime) {
			return;
		}

		const value = particle.getField(this.#field) + this.#rate * elapsedTime;
		particle.setField(this.#field, value);
	}
}
RegisterSource2ParticleOperator('C_OP_RampScalarLinearSimple', RampScalarLinearSimple);
