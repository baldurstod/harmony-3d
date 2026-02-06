
/*
Disabled: replaced by C_INIT_InitFloat
/Create an InitFloat that mimics the old 'random scalar' operator
export class RandomScalar extends Operator {
	min = 0;
	max = 0;
	exponent = 1;
	#fieldOutput = PARTICLE_FIELD_RADIUS;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flMin':
				this.min = param;
				break;
			case 'm_flMax':
				this.max = param;
				break;
			case 'm_flExponent':
				this.exponent = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle, elapsedTime) {
		particle.setInitialField(this.#fieldOutput, RandomFloatExp(this.min, this.max, this.exponent));
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomScalar', RandomScalar);
*/
