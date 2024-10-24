import { vec3 } from 'gl-matrix';
import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';

/**
 * YellowLevel proxy.
 * @comment ouput variable name: resultVar
 */

const URINE_RED = vec3.fromValues(6, 9, 2);
const URINE_BLU = vec3.fromValues(7, 5, 1);

export class YellowLevel extends Proxy {
	#resultVar;
	init() {
		this.#resultVar = this.datas['resultvar'];
	}

	execute(variables, proxyParams) {
		if (!proxyParams.jarate) {
			variables.set(this.#resultVar, vec3.fromValues(1, 1, 1));
		} else {
			if (proxyParams.team == 0) {
				variables.set(this.#resultVar, vec3.scale(vec3.create(), URINE_RED, proxyParams.jarate));
			} else {
				variables.set(this.#resultVar, vec3.scale(vec3.create(), URINE_BLU, proxyParams.jarate));
			}
		}
	}
}
ProxyManager.registerProxy('YellowLevel', YellowLevel);
