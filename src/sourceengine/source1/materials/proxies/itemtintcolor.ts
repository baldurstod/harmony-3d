import { DynamicParams } from '../../../../entities/entity';
import { SourceEngineMaterialVariables } from '../sourceenginematerial';
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

	execute(variables: Map<string, SourceEngineMaterialVariables>, proxyParams: DynamicParams, time: number) {
		variables.set(this.#resultvar, proxyParams.ItemTintColor);
	}
}
ProxyManager.registerProxy('ItemTintColor', ItemTintColor);
