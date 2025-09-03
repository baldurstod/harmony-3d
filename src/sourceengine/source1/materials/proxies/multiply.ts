import { vec3 } from 'gl-matrix';
import { DynamicParams } from '../../../../entities/entity';
import { SourceEngineMaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

/**
 * Multiply proxy. Copies the value of a variable to another.
 * @comment input variable name: srcvar1
 * @comment input variable name: srcvar2
 * @comment ouput variable name: resultVar
 */
export class Multiply extends Proxy {
	init() {
	}

	execute(variables: Map<string, SourceEngineMaterialVariables>, proxyParams: DynamicParams, time: number) {
		super.setResult(variables, variables.get(this.getData('srcvar1')));

		const v1 = variables.get(this.getData('srcvar1'));
		const v2 = variables.get(this.getData('srcvar2'));
		if ((v1 === null) || (v2 === null) || (v1 === undefined) || (v2 === undefined)) {
			super.setResult(variables, null);
			return;
		}

		if (typeof v1 == 'number') {
			if (typeof v2 == 'number') {
				super.setResult(variables, v1 * v2);
			} else {//array
				super.setResult(variables, vec3.fromValues(v1 * v2[0], v1 * v2[1], v1 * v2[2]));
			}
		} else {
			if (typeof v2 == 'number') {
				super.setResult(variables, vec3.fromValues(v1[0] * v2, v1[1] * v2, v1[2] * v2));
			} else {//array
				super.setResult(variables, vec3.fromValues(v1[0] * v2[0], v1[1] * v2[1], v1[2] * v2[2]));
			}
		}
	}
}
ProxyManager.registerProxy('Multiply', Multiply);
