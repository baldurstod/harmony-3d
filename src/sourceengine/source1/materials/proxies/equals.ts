import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';
/**
 * Equals proxy. Copies the value of a variable to another.
 * @comment input variable name: srcvar1
 * @comment ouput variable name: resultVar
 */
export class Equals extends Proxy {
	execute(variables) {
		super.setResult(variables, variables.get(this.getData('srcvar1')));
	}
}
ProxyManager.registerProxy('Equals', Equals);
