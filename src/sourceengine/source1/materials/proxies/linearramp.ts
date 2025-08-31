import { DynamicParams } from '../../../../entities/entity';
import { SourceEngineMaterialVariables } from '../sourceenginematerial';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class LinearRamp extends Proxy {
	#rate = 1;

	init() {
		this.#rate = Number(this.datas['rate'] ?? 1);
	}

	execute(variables: Map<string, SourceEngineMaterialVariables>, proxyParams: DynamicParams, time: number) {
		const initialValue = Number(this.getVariable(variables, 'initialvalue') ?? 0);

		super.setResult(variables, initialValue + time * this.#rate);
	}
}
ProxyManager.registerProxy('LinearRamp', LinearRamp);
