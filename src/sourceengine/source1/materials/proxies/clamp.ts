import { DynamicParams } from '../../../../entities/entity';
import { SourceEngineMaterialVariables } from '../sourceenginematerial';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class Clamp extends Proxy {
	#srcvar1 = '';
	#resultvar = '';
	#minVal = 0;
	#maxVal = 1;

	init() {
		//TODO : removeme
		this.#srcvar1 = this.datas['srcvar1'];
		this.#resultvar = this.datas['resultvar'];
		this.#minVal = this.datas['min'] ?? 0;
		this.#maxVal = this.datas['max'] ?? 1;
	}

	execute(variables: Map<string, SourceEngineMaterialVariables>, proxyParams: DynamicParams, time: number) {
		const v1 = variables.get(this.getData('srcvar1'));
		if ((v1 === null) || (v1 === undefined)) {
			variables.set(this.#resultvar, null);
			return;
		}

		if (typeof v1 == 'number') {
			super.setResult(variables, Math.min(Math.max(v1, this.#minVal), this.#maxVal));
		} else {//array
			const clampedArray: number[] = [];
			for (const i in v1) {
				clampedArray[i as unknown as number] = Math.min(Math.max(v1[i], this.#minVal), this.#maxVal);
			}
			super.setResult(variables, clampedArray);
			/*if (typeof v2=='number') {
				//variables.set(this.r, vec3.fromValues(v1[0]*v2, v1[1]*v2, v1[2]*v2));
				super.setResult(variables, vec3.fromValues(v1[0]*v2, v1[1]*v2, v1[2]*v2));
			} else {//array
				//variables.set(this.r, vec3.fromValues(v1[0]*v2[0], v1[1]*v2[1], v1[2]*v2[2]));
				super.setResult(variables, vec3.fromValues(v1[0]*v2[0], v1[1]*v2[1], v1[2]*v2[2]));
			}*/
		}
	}
}
ProxyManager.registerProxy('Clamp', Clamp);
