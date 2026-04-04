import { DynamicParams } from '../../../../entities/entity';
import { Source1MaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

/**
 * ItemTintColor Proxy
 */
export class ItemTintColor extends Proxy {
	#resultvar = '';

	override init(): void {
		this.#resultvar = this.datas['resultvar'];
	}

	override execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams/*, time: number*/): void {
		variables.set(this.#resultvar, proxyParams.ItemTintColor);
	}
}
ProxyManager.registerProxy('ItemTintColor', ItemTintColor);
