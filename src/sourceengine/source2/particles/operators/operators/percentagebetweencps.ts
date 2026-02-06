
/*
const va = vec3.create();
const vb = vec3.create();

const DEFAULT_INPUT_MIN = 0;
const DEFAULT_INPUT_MAX = 1;
const DEFAULT_INPUT_BIAS = 0.5;
*/

// Disabled: seems to have disappear
/*
export class PercentageBetweenCPs extends Operator {
	#fieldOutput = PARTICLE_FIELD_RADIUS;
	#inputMin = 0;
	#inputMax = 1;
	#inputBias = DEFAULT_INPUT_BIAS;
	#outputMin = 0;
	#outputMax = 1;
	startCP = 0;
	endCP = 1;
	activeRange = false;
	radialCheck = true;
	scaleInitialRange = false;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_flInputMin':
				this.#inputMin = param.getValueAsNumber() ?? DEFAULT_INPUT_MIN;
				break;
			case 'm_flInputMax':
				this.#inputMax = param.getValueAsNumber() ?? DEFAULT_INPUT_MAX;
				break;
			case 'm_flInputBias':
				this.#inputBias = param.getValueAsNumber() ?? DEFAULT_INPUT_BIAS;
				break;
			case 'm_flOutputMin':
				this.#outputMin = param;
				break;
			case 'm_flOutputMax':
				this.#outputMax = param;
				break;
			case 'm_nStartCP':
				this.startCP = (param);
				break;
			case 'm_nEndCP':
				this.endCP = (param);
				break;
			case 'm_nSetMethod':
				this.setMethod = param;
				break;
			case 'm_bActiveRange':
				this.activeRange = param;
				break;
			case 'm_bRadialCheck':
				this.radialCheck = param;
				break;
			case 'm_bScaleInitialRange':
				this.scaleInitialRange = param;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doOperate(particle: Source2Particle , elapsedTime: number, strength: number): void {
		const startCpPos = this.system.getControlPoint(this.startCP).currentWorldPosition;
		const endCPPos = this.system.getControlPoint(this.endCP).currentWorldPosition;

		let percentage;
		const dist = vec3.distance(startCpPos, endCPPos);
		if (this.radialCheck) {
			const dist2 = vec3.distance(startCpPos, particle.position);
			percentage = dist2 / dist;
		} else {
			vec3.sub(va, particle.position, startCpPos);
			vec3.sub(vb, endCPPos, startCpPos);
			//TODO: check dot product this is not right
			percentage = vec3.dot(va, vb) / (dist * dist);
		}


		if (percentage < this.#inputMin || percentage > this.#inputMax) {
			return;
		}


		const value = RemapValClamped(percentage, this.#inputMin, this.#inputMax, this.#outputMin, this.#outputMax);
		particle.setField(this.#fieldOutput, value, this.scaleInitialRange || this.setMethod == Source2ParticleSetMethod.ScaleInitial);
	}
}
RegisterSource2ParticleOperator('C_OP_PercentageBetweenCPs', PercentageBetweenCPs);
*/
