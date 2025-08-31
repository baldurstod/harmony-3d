import { DynamicParams } from '../../../../entities/entity';
import { SourceEngineMaterialVariables } from '../sourceenginematerial';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';
/**
 * Equals proxy. Copies the value of a variable to another.
 * @comment input variable name: srcvar1
 * @comment ouput variable name: resultVar
 */
export class Equals extends Proxy {
	execute(variables: Map<string, SourceEngineMaterialVariables>, proxyParams: DynamicParams, time: number) {
		super.setResult(variables, variables.get(this.getData('srcvar1')));
	}
}
ProxyManager.registerProxy('Equals', Equals);
