import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class WeaponInvis extends Proxy {
}
ProxyManager.registerProxy('weapon_invis', WeaponInvis);
