import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class BuildingInvis extends Proxy {
}
ProxyManager.registerProxy('building_invis', BuildingInvis);
