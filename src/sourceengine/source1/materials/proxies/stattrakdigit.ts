import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';
/**
 * StatTrakDigit Proxy
 */

export class StatTrakDigit extends Proxy {
	#displayDigit = 0;
	#resultVar;
	#trimZeros: boolean;
	init() {
		this.#trimZeros = this.datas['trimzeros'];
		this.#resultVar = this.datas['resultvar'];
		this.#displayDigit = this.datas['displaydigit'] ?? 0;
	}

	execute(variables, proxyParams, time) {
		const number = proxyParams.StatTrakNumber || 0;
		const numberasstring = String(number);
		let digit = Math.floor(number / (Math.pow(10, this.#displayDigit)) % 10);

		// Trim zeroes
		if (this.#trimZeros && digit == 0 && (this.#displayDigit >= numberasstring.length)) {
			digit = 10; // Blank frame
		}
		variables.set(this.#resultVar, digit);
	}
}
ProxyManager.registerProxy('StatTrakDigit', StatTrakDigit);
