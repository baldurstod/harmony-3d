import { DynamicParams } from '../../../../entities/entity';
import { Source1MaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class LinearRamp extends Proxy {
	#rate = 1;

	init() {
		this.#rate = Number(this.datas['rate'] ?? 1);
	}

	execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number) {
		const initialValue = Number(this.getVariable(variables, 'initialvalue') ?? 0);

		super.setResult(variables, initialValue + time * this.#rate);
	}
}
ProxyManager.registerProxy('LinearRamp', LinearRamp);
