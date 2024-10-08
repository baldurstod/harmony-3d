import { vec3 } from 'gl-matrix';

import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';

export class IntProxy extends Proxy {
	init() {
	}

	execute(variables) {
		super.setResult(variables, variables.get(this.getData('srcvar1')));

		const v1 = variables.get(this.getData('srcvar1'));
		//const v2 = variables.get(this.getData('srcvar2'));
		if ((v1===null) || (v1=== undefined)) {
			super.setResult(variables, null);
			return;
		}

		if (typeof v1=='number') {
			super.setResult(variables, Math.round(v1));
		} else {
			super.setResult(variables, vec3.fromValues(Math.round(v1[0]), Math.round(v1[1]), Math.round(v1[2])));
		}
	}
}
ProxyManager.registerProxy('Int', IntProxy);
