export class SourceEngineParticleOperators {
	static #functions = {};
	static #functionsType = {};

	static getOperator(name) {
		const n = name.replace(/\_/g, ' ').toLowerCase();
		if (!this.#functions[n]) {
			return null;
		}
		return new this.#functions[n]();
	}

	static #register(type, name, className) {
		this.#functions[name.replace(/\_/g, ' ').toLowerCase()] = className;

		this.#functionsType[type] = this.#functionsType[type] ?? [];
		this.#functionsType[type].push(name);
	}

	static getOperators(type) {
		return this.#functionsType[type] ?? [];
	}

	static registerOperator(name, className) {
		if (className) {
			this.#register('Operators', name, className);
		} else {
			this.#register('Operators', name.functionName, name);
		}
	}

}
