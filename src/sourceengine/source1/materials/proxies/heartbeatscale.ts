import { ProxyManager } from './proxymanager';
import { TWO_PI } from '../../../../math/constants';
import { clamp } from '../../../../math/functions';
import { Proxy } from './proxy';

const scale = 0.6;
const loBeat = 1.0 * scale;
const hiBeat = 0.8 * scale;

export class HeartbeatScale extends Proxy {
	#datas;
	#sineperiod: number;
	#resultVar;
	#delta;
	#mid;
	#p;
	setParams(datas) {
		this.#datas = datas;
		this.init();
	}

	init() {
		this.#sineperiod = 1;
		this.#resultVar = this.#datas['resultvar'];
		this.#delta = 0.2;
		this.#mid = 1.0;
		this.#p = 2 * Math.PI / this.#sineperiod;
	}

	execute(variables, proxyParams, time) {
		let s1 = Math.sin(time * TWO_PI);
		s1 = clamp(s1, 0.0, 1.0);
		s1 *= s1;
		s1 *= s1;
		s1 = clamp(s1, 0.5, 1.0);
		s1 -= 0.5;
		s1 *= 2.0;

		let s2 = Math.sin((time + 0.25) * TWO_PI);
		s2 = clamp(s2, 0.0, 1.0);
		s2 *= s2;
		s2 *= s2;
		s2 = clamp(s2, 0.5, 1.0);
		s2 -= 0.5;
		s2 *= 2.0;

		const beat = Math.max(s1, s2);

		const scaledBeat = loBeat + (hiBeat - loBeat) * beat;

		variables.set(this.#resultVar, scaledBeat);
	}
}
ProxyManager.registerProxy('HeartbeatScale', HeartbeatScale);
