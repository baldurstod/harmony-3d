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

	init() {
		this.#resultVar = this.datas['resultvar'];
	}

	execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number) {
		variables.set(this.#resultVar, proxyParams.ModelGlowColor ?? [1, 1, 1]);
	}
}
ProxyManager.registerProxy('ModelGlowColor', ModelGlowColor);
