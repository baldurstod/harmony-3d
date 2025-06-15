import { vec3 } from 'gl-matrix';
import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';
import { lerp } from '../../../../math/functions';

export class StatTrakIllum extends Proxy {
	#resultVar;
	#minVal: number;
	#maxVal: number;
	init() {
		this.#resultVar = this.datas['resultvar'];
		this.#minVal = Number(this.datas['minval'] ?? 0);
		this.#maxVal = Number(this.datas['maxval'] ?? 1);
	}

	execute(variables, proxyParams) {
		const glowMultiplier = proxyParams.GlowMultiplier ?? 0.5;
		const value = lerp(this.#minVal, this.#maxVal, glowMultiplier);
		variables.set(this.#resultVar, vec3.fromValues(value, value, value));
	}
}
ProxyManager.registerProxy('StatTrakIllum', StatTrakIllum);
