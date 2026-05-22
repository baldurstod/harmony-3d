import { vec3 } from 'gl-matrix';
import { Source1MaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

/**
 * Abs proxy. Return the absolute value of srcvar1
 * @comment input variable name: srcvar1
 * @comment ouput variable name: resultVar
 */
export class Abs extends Proxy {
	override execute(variables: Map<string, Source1MaterialVariables>/*, proxyParams: DynamicParams, time: number*/): void {
		super.setResult(variables, variables.get(this.getData('srcvar1')));

		const v1 = variables.get(this.getData('srcvar1'));
		if ((v1 === null) || (v1 === undefined)) {
			super.setResult(variables, null);
			return;
		}

		if (typeof v1 == 'number') {
			super.setResult(variables, Math.abs(v1));
		} else {
			super.setResult(variables, vec3.fromValues(Math.abs(v1[0]), Math.abs(v1[1]), Math.abs(v1[2])));
		}
	}
}
ProxyManager.registerProxy('Abs', Abs);
