import { DynamicParams } from '../../../../entities/entity';
import { SourceEngineMaterialVariables } from '../sourceenginematerial';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class StickybombGlowColor extends Proxy {
	#resultVar = '';

	init() {
		this.#resultVar = this.datas['resultvar'];
	}

	execute(variables: Map<string, SourceEngineMaterialVariables>, proxyParams: DynamicParams, time: number) {
		variables.set(this.#resultVar, [1, 1, 1]);
	}
}
ProxyManager.registerProxy('StickybombGlowColor', StickybombGlowColor);
