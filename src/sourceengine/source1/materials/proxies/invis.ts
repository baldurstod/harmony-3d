import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';
/**
 * Invis proxy.
 * @comment ouput variable name: resultVar
 */
export class Invis extends Proxy {
}
ProxyManager.registerProxy('Invis', Invis);
