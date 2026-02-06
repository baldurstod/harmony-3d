
//const v = vec3.create();

/*
DISABLED: replaced by C_INIT_InitVec
//Create an InitVec that mimics the old 'Offset Vector' operator
export class OffsetVectorToVector extends Operator {
	outputMin = vec3.create();
	outputMax = vec3.fromValues(1, 1, 1);
	#fieldOutput = PARTICLE_FIELD_POSITION;
	#fieldInput = PARTICLE_FIELD_POSITION;

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_vecOutputMin':
				vec3.copy(this.outputMin, param);
				break;
			case 'm_vecOutputMax':
				vec3.copy(this.outputMax, param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle, elapsedTime) {
		vec3RandomBox(v, this.outputMin, this.outputMax);
		vec3.add(v, v, particle.getField(this.#fieldInput));
		if (this.#fieldOutput == PARTICLE_FIELD_COLOR) {
			v[0] = ((v[0] % ONE_EPS) + ONE_EPS) % ONE_EPS;
			v[1] = ((v[1] % ONE_EPS) + ONE_EPS) % ONE_EPS;
			v[2] = ((v[2] % ONE_EPS) + ONE_EPS) % ONE_EPS;
		}
		particle.setField(this.#fieldOutput, v);
	}
}
RegisterSource2ParticleOperator('C_INIT_OffsetVectorToVector', OffsetVectorToVector);
*/
