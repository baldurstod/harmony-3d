import { DynamicParams } from '../../../../entities/entity';
import { clamp } from '../../../../math/functions';
import { Source1MaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class GaussianNoiseProxy extends Proxy {
	#mean!: number;
	#halfwidth!: number;
	#minVal!: number;
	#maxVal!: number;
	#resultVar = '';

	override init(): void {
		this.#mean = this.datas['mean'] ?? 0;
		this.#halfwidth = this.datas['halfwidth'] ?? 1;
		this.#minVal = this.datas['minVal'] ?? -Infinity;
		this.#maxVal = this.datas['maxVal'] ?? Infinity;
		this.#resultVar = this.datas['resultvar'];

		if (this.#minVal > this.#maxVal) {
			const tmp = this.#maxVal;
			this.#maxVal = this.#minVal;
			this.#minVal = tmp;
		}
	}

	override execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void {
		// TODO: create an actual gaussian; see CGaussianRandomStream
		const gaussian = Math.random() * this.#halfwidth + this.#mean;
		variables.set(this.#resultVar, clamp(gaussian, this.#minVal, this.#maxVal));
	}
}
ProxyManager.registerProxy('GaussianNoise', GaussianNoiseProxy);
