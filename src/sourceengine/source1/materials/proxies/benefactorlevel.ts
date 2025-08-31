import { DynamicParams } from '../../../../entities/entity';
import { SourceEngineMaterialVariables } from '../sourceenginematerial';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

const minValue = 5.0;
const maxValue = 1.0;

export class BenefactorLevel extends Proxy {
	#resultVar = '';

	init() {
		this.#resultVar = this.datas['resultvar'];
	}

	execute(variables: Map<string, SourceEngineMaterialVariables>, proxyParams: DynamicParams, time: number) {
		const value = 1.0;
		variables.set(this.#resultVar, minValue + (maxValue - minValue) * value);
	}
}
ProxyManager.registerProxy('BenefactorLevel', BenefactorLevel);
