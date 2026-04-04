import { Source1MaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class StickybombGlowColor extends Proxy {
	#resultVar = '';

	override init(): void {
		this.#resultVar = this.datas['resultvar'];
	}

	override execute(variables: Map<string, Source1MaterialVariables>/*, proxyParams: DynamicParams, time: number*/): void {
		variables.set(this.#resultVar, [1, 1, 1]);
	}
}
ProxyManager.registerProxy('StickybombGlowColor', StickybombGlowColor);
