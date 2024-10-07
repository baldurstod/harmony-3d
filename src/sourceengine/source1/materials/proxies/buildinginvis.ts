import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';

export class BuildingInvis extends Proxy {
}
ProxyManager.registerProxy('building_invis', BuildingInvis);
