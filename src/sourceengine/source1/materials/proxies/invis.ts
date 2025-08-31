import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';
/**
 * Invis proxy.
 * @comment ouput variable name: resultVar
 */
export class Invis extends Proxy {
}
ProxyManager.registerProxy('Invis', Invis);
