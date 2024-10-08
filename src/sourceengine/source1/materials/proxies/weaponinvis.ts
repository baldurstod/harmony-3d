import { ProxyManager } from './proxymanager.js';
import { Proxy } from './proxy.js';

export class WeaponInvis extends Proxy {
}
ProxyManager.registerProxy('weapon_invis', WeaponInvis);
