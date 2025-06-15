import { mat4 } from 'gl-matrix';

import { ProxyManager } from './proxymanager';
import { MatrixBuildTranslation, MatrixBuildScale } from './texturetransform';
import { Proxy } from './proxy';

const TEMP_MAT4 = mat4.create();

export class BuildingRescueLevel extends Proxy {
	#datas;
	#r;
	setParams(datas) {
		this.#datas = datas;
		this.init();
	}

	init() {
		this.#r = this.#datas['resultvar'];
	}

	execute(variables) {
		const v = variables.get(this.#r);
		if (v) {
			const iAmmo = 200;
			const maxAmmo = 200;
			const iIncreasedRangeCost = 100;
			let scale = 1.0;
			if (iAmmo < iIncreasedRangeCost) {
				scale = 10.0;
			} else {
				scale = (3.0 - ((iAmmo - iIncreasedRangeCost) / (maxAmmo - iIncreasedRangeCost) * 3.0) + 1.0);
			}

			MatrixBuildTranslation(v, -0.5, -0.5, 0.0);

			// scale
			{
				MatrixBuildScale(TEMP_MAT4, 1.0, scale, 1.0);
				mat4.mul(v, TEMP_MAT4, v);
			}

			MatrixBuildTranslation(TEMP_MAT4, 0.5, 0.5, 0.0);
			mat4.mul(v, TEMP_MAT4, v);
		}
	}
}
ProxyManager.registerProxy('BuildingRescueLevel', BuildingRescueLevel);
