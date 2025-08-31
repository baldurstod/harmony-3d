import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class CommunityWeapon extends Proxy {
}
ProxyManager.registerProxy('communityweapon', CommunityWeapon);
