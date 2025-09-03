import { DynamicParams } from '../../../../entities/entity';
import { SourceEngineMaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';
/**
 * BurnLevel proxy.
 * @comment ouput variable name: resultVar
 */

export class BurnLevel extends Proxy {
	#r = '';

	init() {
		this.#r = this.datas['resultvar'];
	}

	execute(variables: Map<string, SourceEngineMaterialVariables>, proxyParams: DynamicParams, time: number) {
		variables.set(this.#r, proxyParams.burnlevel ?? 0);
	}
}
ProxyManager.registerProxy('BurnLevel', BurnLevel);
