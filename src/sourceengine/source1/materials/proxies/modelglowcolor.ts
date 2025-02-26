import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';

/**
 * ModelGlowColor proxy.
 * @comment ouput variable name: resultVar
 */
export class ModelGlowColor extends Proxy {
	#resultVar;
	init() {
		this.#resultVar = this.datas['resultvar'];
	}

	execute(variables, proxyParams) {
		variables.set(this.#resultVar, proxyParams.ModelGlowColor ?? [1, 1, 1]);
	}
}
ProxyManager.registerProxy('ModelGlowColor', ModelGlowColor);
