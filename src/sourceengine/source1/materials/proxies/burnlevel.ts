import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';
/**
 * BurnLevel proxy.
 * @comment ouput variable name: resultVar
 */

export class BurnLevel extends Proxy {
	#r;
	init() {
		this.#r = this.datas['resultvar'];
	}

	execute(variables, proxyParams) {
		variables.set(this.#r, proxyParams.burnlevel ?? 0);
	}
}
ProxyManager.registerProxy('BurnLevel', BurnLevel);
