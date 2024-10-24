import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';

export class StickybombGlowColor extends Proxy {
	#resultVar;
	init() {
		this.#resultVar = this.datas['resultvar'];
	}

	execute(variables, proxyParams) {
		variables.set(this.#resultVar, [1, 1, 1]);
	}
}
ProxyManager.registerProxy('StickybombGlowColor', StickybombGlowColor);
