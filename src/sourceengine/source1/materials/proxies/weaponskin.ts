import { ProxyManager } from './proxymanager';
import { Proxy } from './proxy';

export class WeaponSkin extends Proxy {
	#defaultTexture = null;

	execute(variables, proxyParams) {
		if (!this.#defaultTexture) {
			this.#defaultTexture = variables.get('$basetexture');
		}
		if (proxyParams['WeaponSkin']) {
			variables.set('$basetexture', proxyParams['WeaponSkin']);
		} else {
			variables.set('$basetexture', this.#defaultTexture);
		}
	}
}
ProxyManager.registerProxy('WeaponSkin', WeaponSkin);
