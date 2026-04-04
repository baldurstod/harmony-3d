import { Source1MaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

const minValue = 5.0;
const maxValue = 1.0;

export class BenefactorLevel extends Proxy {
	#resultVar = '';

	override init(): void {
		this.#resultVar = this.datas['resultvar'];
	}

	override execute(variables: Map<string, Source1MaterialVariables>/*, proxyParams: DynamicParams, time: number*/): void {
		const value = 1.0;
		variables.set(this.#resultVar, minValue + (maxValue - minValue) * value);
	}
}
ProxyManager.registerProxy('BenefactorLevel', BenefactorLevel);
