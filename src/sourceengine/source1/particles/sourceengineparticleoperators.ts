import { SourceEngineParticleOperator } from './operators/operator';
import { SourceEngineParticleSystem } from './sourceengineparticlesystem';

export class SourceEngineParticleOperators {
	static #functions: Record<string, typeof SourceEngineParticleOperator> = {};//TODO: create Map
	static #functionsType: Record<string, string[]> = {};//TODO: create Map

	static getOperator(system: SourceEngineParticleSystem, name: string) {
		const n = name.replace(/\_/g, ' ').toLowerCase();
		if (!this.#functions[n]) {
			return null;
		}
		return new this.#functions[n](system);
	}

	static #register(type: string, name: string, className: typeof SourceEngineParticleOperator) {
		this.#functions[name.replace(/\_/g, ' ').toLowerCase()] = className;

		this.#functionsType[type] = this.#functionsType[type] ?? [];
		this.#functionsType[type].push(name);
	}

	static getOperators(type: string) {
		return this.#functionsType[type] ?? [];
	}

	static registerOperator(name: string | typeof SourceEngineParticleOperator, operator?: typeof SourceEngineParticleOperator) {

		if (operator) {
			this.#register('Operators', name as string, operator);
		} else {
			this.#register('Operators', (name as typeof SourceEngineParticleOperator).functionName, name as typeof SourceEngineParticleOperator);
		}
	}

}
