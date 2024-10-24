import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';

/**
 * ItemTintColor Proxy
 */
export class ItemTintColor extends Proxy {
	#resultvar;
	init() {
		this.#resultvar = this.datas['resultvar'];
	}

	execute(variables, proxyParams) {
		variables.set(this.#resultvar, proxyParams.ItemTintColor);
	}
}
ProxyManager.registerProxy('ItemTintColor', ItemTintColor);
