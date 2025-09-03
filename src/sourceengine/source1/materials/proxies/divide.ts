import { vec3 } from 'gl-matrix';
import { DynamicParams } from '../../../../entities/entity';
import { SourceEngineMaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

/**
 * Divide proxy. Copies the value of a variable to another.
 * @comment input variable name: srcvar1
 * @comment input variable name: srcvar2
 * @comment ouput variable name: resultVar
 */
export class Divide extends Proxy {

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
				//variables.get(this.r, v1*v2);
				super.setResult(variables, v1 / v2);
			} else {//array
				//variables.get(this.r, vec3.fromValues(v1*v2[0], v1*v2[1], v1*v2[2]));
				super.setResult(variables, vec3.fromValues(v1 / v2[0], v1 / v2[1], v1 / v2[2]));
			}
		} else {
			if (typeof v2 == 'number') {
				//variables.get(this.r, vec3.fromValues(v1[0]*v2, v1[1]*v2, v1[2]*v2));
				super.setResult(variables, vec3.fromValues(v1[0] / v2, v1[1] / v2, v1[2] / v2));
			} else {//array
				//variables.get(this.r, vec3.fromValues(v1[0]*v2[0], v1[1]*v2[1], v1[2]*v2[2]));
				super.setResult(variables, vec3.fromValues(v2[0] ? (v1[0] / v2[0]) : 0, v2[1] ? (v1[1] / v2[1]) : 0, v2[2] ? (v1[2] / v2[2]) : 0));
			}
		}
	}
}
ProxyManager.registerProxy('Divide', Divide);
