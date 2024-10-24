import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';

export class LinearRamp extends Proxy {
	#rate;
	init() {
		this.#rate = Number(this.datas['rate'] ?? 1);
	}

	execute(variables, proxyParams, time) {
		const initialValue = Number(this.getVariable(variables, 'initialvalue') ?? 0);

		super.setResult(variables, initialValue + time * this.#rate);
	}
}
ProxyManager.registerProxy('LinearRamp', LinearRamp);
