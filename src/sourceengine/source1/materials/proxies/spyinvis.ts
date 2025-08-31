import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';
/**
 * SpyInvis proxy.
 * @comment ouput variable name: resultVar
 */

export class SpyInvis extends Proxy {
}
ProxyManager.registerProxy('Spy_Invis', SpyInvis);
