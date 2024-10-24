import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';
/**
 * SpyInvis proxy.
 * @comment ouput variable name: resultVar
 */

export class SpyInvis extends Proxy {
}
ProxyManager.registerProxy('Spy_Invis', SpyInvis);
