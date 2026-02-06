
/*
DISABLED: replaced by C_INIT_InitFloat
//Create an InitFloat that mimics the old 'random radius' operator
export class RandomRadius extends Operator {
	radiusMin = 1;
	radiusMax = 1;
	radiusRandExponent = 1;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flRadiusMin':
				this.radiusMin = param;
				break;
			case 'm_flRadiusMax':
				this.radiusMax = param;
				break;
			case 'm_flRadiusRandExponent':
				this.radiusRandExponent = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle, elapsedTime) {
		particle.setInitialRadius(RandomFloatExp(this.radiusMin, this.radiusMax, this.radiusRandExponent));
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomRadius', RandomRadius);
*/
