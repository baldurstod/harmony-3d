import { Source1MaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';
/**
 * SelectFirstIfNonZero Proxy
 */
export class SelectFirstIfNonZero extends Proxy {
	#srcVar1 = '';
	#srcVar2 = '';

	override init(): void {
		this.#srcVar1 = (this.datas['srcvar1'] as string ?? '').toLowerCase();
		this.#srcVar2 = (this.datas['srcvar2'] as string ?? '').toLowerCase();
	}

	override execute(variables: Map<string, Source1MaterialVariables>/*, proxyParams: DynamicParams, time: number*/): void {
		super.setResult(variables, this.#isNonZero(variables.get(this.#srcVar1)) ? variables.get(this.#srcVar1) : variables.get(this.#srcVar2));
	}

	#isNonZero(value: any/*TODO: improve type*/): boolean {
		if (!value) return false;
		if (value instanceof Array || value instanceof Float32Array) {
			for (const v of value) {
				if (v) {
					return true;
				}
			}
		}
		return false;
	}
}

ProxyManager.registerProxy('SelectFirstIfNonZero', SelectFirstIfNonZero);
