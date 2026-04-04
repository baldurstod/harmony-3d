import { DynamicParams } from '../../../../entities/entity';
import { Source1MaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';
/**
 * BurnLevel proxy.
 * @comment ouput variable name: resultVar
 */

export class BurnLevel extends Proxy {
	#r = '';

	override init(): void {
		this.#r = this.datas['resultvar'];
	}

	override execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams/*, time: number*/): void {
		variables.set(this.#r, proxyParams.burnlevel ?? 0);
	}
}
ProxyManager.registerProxy('BurnLevel', BurnLevel);
