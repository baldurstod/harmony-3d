import { DynamicParams } from '../../../../entities/entity';
import { Source1MaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

/**
 * InvulnLevel Proxy
 */
export class InvulnLevelProxy extends Proxy {
	#resultVar = '';

	override init(): void {
		this.#resultVar = this.datas['resultvar'];
	}

	override execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams/*, time: number*/): void {
		variables.set(this.#resultVar, proxyParams.Invulnerable ? 1 : 0);
	}
}
ProxyManager.registerProxy('BurnLevel', InvulnLevelProxy);
