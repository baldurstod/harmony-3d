import { DynamicParams } from '../../../../entities/entity';
import { Source1MaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class UniformNoiseProxy extends Proxy {
	execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number) {
		super.setResult(variables, variables.get(this.getData('srcvar1')));

		const minVal = (this.getData('minval') ?? 0) * 1;
		const maxVal = (this.getData('maxval') ?? 1) * 1;

		super.setResult(variables, Math.random() * (maxVal - minVal) + minVal);
	}
}
ProxyManager.registerProxy('UniformNoise', UniformNoiseProxy);

/*
		"UniformNoise"
		{
			"minVal"		"-0.001000"
			"maxVal"		"0.001000"
			"resultVar"		"$noise_alpha"
		}
*/
