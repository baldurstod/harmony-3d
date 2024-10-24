import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';

export class WeaponInvis extends Proxy {
}
ProxyManager.registerProxy('weapon_invis', WeaponInvis);
