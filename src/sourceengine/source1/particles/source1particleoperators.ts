import { Source1ParticleOperator } from './operators/operator';
import { Source1ParticleSystem } from './source1particlesystem';

export class Source1ParticleOperators {
	static #functions: Record<string, typeof Source1ParticleOperator> = {};//TODO: create Map
	static #functionsType: Record<string, string[]> = {};//TODO: create Map

	static getOperator(system: Source1ParticleSystem, name: string) {
		const n = name.replace(/\_/g, ' ').toLowerCase();
		if (!this.#functions[n]) {
			return null;
		}
		return new this.#functions[n](system);
	}

	static #register(type: string, name: string, className: typeof Source1ParticleOperator) {
		this.#functions[name.replace(/\_/g, ' ').toLowerCase()] = className;

		this.#functionsType[type] = this.#functionsType[type] ?? [];
		this.#functionsType[type].push(name);
	}

	static getOperators(type: string) {
		return this.#functionsType[type] ?? [];
	}

	static registerOperator(name: string | typeof Source1ParticleOperator, operator?: typeof Source1ParticleOperator) {

		if (operator) {
			this.#register('Operators', name as string, operator);
		} else {
			this.#register('Operators', (name as typeof Source1ParticleOperator).functionName, name as typeof Source1ParticleOperator);
		}
	}

}
