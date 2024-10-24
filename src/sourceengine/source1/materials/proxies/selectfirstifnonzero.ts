import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';
/**
 * SelectFirstIfNonZero Proxy
 */
export class SelectFirstIfNonZero extends Proxy {
	#srcVar1;
	#srcVar2;
	init() {
		this.#srcVar1 = (this.datas['srcvar1'] ?? '').toLowerCase();
		this.#srcVar2 = (this.datas['srcvar2'] ?? '').toLowerCase();
	}

	execute(variables) {
		super.setResult(variables, this.isNonZero(variables.get(this.#srcVar1)) ? variables.get(this.#srcVar1) : variables.get(this.#srcVar2));
	}

	isNonZero(value) {
		if (!value) return false;
			if (value instanceof Array || value instanceof Float32Array) {
			for (let i = 0; i < value.length; ++i) {
				if (value[i]) {
					return true;
				}
			}
		}
		return false;
	}
}

ProxyManager.registerProxy('SelectFirstIfNonZero', SelectFirstIfNonZero);
