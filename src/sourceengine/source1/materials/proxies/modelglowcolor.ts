import { DynamicParams } from '../../../../entities/entity';
import { Source1MaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

/**
 * ModelGlowColor proxy.
 * @comment ouput variable name: resultVar
 */
export class ModelGlowColor extends Proxy {
	#resultVar = '';

	override init(): void {
		this.#resultVar = this.datas['resultvar'];
	}

	override execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams/*, time: number*/): void {
		variables.set(this.#resultVar, proxyParams.ModelGlowColor ?? [1, 1, 1]);
	}
}
ProxyManager.registerProxy('ModelGlowColor', ModelGlowColor);
