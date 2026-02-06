
//const va = vec3.create();
//const vb = vec3.create();

/*
DISABLED: replaced by C_INIT_InitVec
//Create an InitVec that mimics the old 'Add Vector to Vector' operator
export class AddVectorToVector extends Operator {
	#fieldOutput = PARTICLE_FIELD_POSITION;
	#fieldInput = PARTICLE_FIELD_POSITION;
	scale = vec3.fromValues(1, 1, 1);
	offsetMin = vec3.create();
	offsetMax = vec3.fromValues(1, 1, 1);

	override _paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_vecScale':
				vec3.copy(this.scale, param);
				break;
			case 'm_vOffsetMin':
				vec3.copy(this.offsetMin, param);
				break;
			case 'm_vOffsetMax':
				vec3.copy(this.offsetMax, param);
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	override doInit(particle, elapsedTime) {
		vec3.copy(va, particle.getField(this.#fieldInput));
		vec3RandomBox(vb, this.offsetMin, this.offsetMax);

		va[0] = (va[0] * (1 + this.scale[0]) + vb[0]) * 0.5;
		va[1] = (va[1] * (1 + this.scale[1]) + vb[1]) * 0.5;
		va[2] = (va[2] * (1 + this.scale[2]) + vb[2]) * 0.5;

		if (this.#fieldOutput == PARTICLE_FIELD_COLOR) {
			va[0] = ((va[0] % ONE_EPS) + ONE_EPS) % ONE_EPS;
			va[1] = ((va[1] % ONE_EPS) + ONE_EPS) % ONE_EPS;
			va[2] = ((va[2] % ONE_EPS) + ONE_EPS) % ONE_EPS;
		}
		particle.setField(this.#fieldOutput, va);
	}
}
RegisterSource2ParticleOperator('C_INIT_AddVectorToVector', AddVectorToVector);
*/
