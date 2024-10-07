import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';

export class CommunityWeapon extends Proxy {
}
ProxyManager.registerProxy('communityweapon', CommunityWeapon);
