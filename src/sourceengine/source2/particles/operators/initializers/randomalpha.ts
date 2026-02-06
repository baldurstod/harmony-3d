
/*
DISABLED: replaced by C_INIT_InitFloat
//Create an InitFloat that mimics the old 'Random Alpha' operator
export class RandomAlpha extends Operator {
	alphaMin = 255;
	alphaMax = 255;
	alphaRandExponent = 1;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_nAlphaMin':
				this.alphaMin = (param);
				break;
			case 'm_nAlphaMax':
				this.alphaMax = (param);
				break;
			case 'm_flAlphaRandExponent':
				this.alphaRandExponent = (param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle, elapsedTime) {
		const alpha = RandomFloatExp(this.alphaMin, this.alphaMax, this.alphaRandExponent) / 255.0;
		particle.alpha = alpha;
		particle.startAlpha = alpha;
		//TODO: use fieldOutput
	}
}
RegisterSource2ParticleOperator('C_INIT_RandomAlpha', RandomAlpha);
*/
