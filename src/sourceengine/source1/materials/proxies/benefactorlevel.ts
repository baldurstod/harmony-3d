import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

const minValue = 5.0;
const maxValue = 1.0;

export class BenefactorLevel extends Proxy {
	#datas;
	#resultVar;
	setParams(datas) {
		this.#datas = datas;
		this.init();
	}

	init() {
		this.#resultVar = this.#datas['resultvar'];
	}

	execute(variables) {
		let value = 1.0;
		variables.set(this.#resultVar, minValue + ( maxValue - minValue ) * value);
	}
}
ProxyManager.registerProxy('BenefactorLevel', BenefactorLevel);
