import { DynamicParams } from '../../../../entities/entity';
import { Source1MaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

/**
 * ItemTintColor Proxy
 */
export class ItemTintColor extends Proxy {
	#resultvar = '';

	init() {
		this.#resultvar = this.datas['resultvar'];
	}

	execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number) {
		variables.set(this.#resultvar, proxyParams.ItemTintColor);
	}
}
ProxyManager.registerProxy('ItemTintColor', ItemTintColor);
