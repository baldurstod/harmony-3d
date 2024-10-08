import { ProxyManager } from './proxymanager.js';
import { Proxy } from './proxy.js';

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
