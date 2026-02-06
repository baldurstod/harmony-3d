
/*
DISABLED: replaced by C_INIT_InitFloat
//Create an InitFloat that mimics the old 'lifetime random' operator
export class RandomLifeTime extends Operator {
	lifetimeMin = 0;
	lifetimeMax = 0;
	lifetimeRandExponent = 1;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_fLifetimeMin':
				this.lifetimeMin = (param);
				break;
			case 'm_fLifetimeMax':
				this.lifetimeMax = (param);
				break;
			case 'm_fLifetimeRandExponent':
				this.lifetimeRandExponent = (param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle, elapsedTime) {
		particle.setInitialTTL(RandomFloatExp(this.lifetimeMin, this.lifetimeMax, this.lifetimeRandExponent));
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomLifeTime', RandomLifeTime);
*/
