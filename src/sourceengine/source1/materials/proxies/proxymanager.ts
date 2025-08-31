import { Proxy } from './proxy';

/**
 * Proxy manager
 */
export class ProxyManager {
	static #proxyList: Record<string, typeof Proxy> = {};//TODO: turn into map

	static getProxy(proxyName: string) {
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

	static registerProxy(proxyName: string, proxyClass: typeof Proxy) {
		if (!proxyClass) { return; }
		const name = proxyName.toLowerCase();

		this.#proxyList[name] = proxyClass;
	}
}
