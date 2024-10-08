import { ProxyManager } from './proxymanager.js';
import { Proxy } from './proxy.js';
/**
 * SpyInvis proxy.
 * @comment ouput variable name: resultVar
 */

export class SpyInvis extends Proxy {
}
ProxyManager.registerProxy('Spy_Invis', SpyInvis);
