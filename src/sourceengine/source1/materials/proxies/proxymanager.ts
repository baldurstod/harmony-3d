import { Proxy } from './proxy';

/**
 * Proxy manager
 */
export class ProxyManager {
	static #proxyList = {};

	static getProxy(proxyName) {
		if (!proxyName) {
			return;
		}
		proxyName = proxyName.toLowerCase();
		const proxy = this.#proxyList[proxyName];
		if (!proxy) {
			return null;
		}
		return new proxy();
	}

	static registerProxy(proxyName, proxyClass: typeof Proxy) {
		if (!proxyClass) { return; }
		const name = proxyName.toLowerCase();

		this.#proxyList[name] = proxyClass;
	}
}
