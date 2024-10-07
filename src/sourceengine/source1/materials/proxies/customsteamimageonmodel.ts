import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

/**
 * CustomSteamImageOnModel proxy.
 * @comment ouput variable name: resultVar
 */
export class CustomSteamImageOnModel extends Proxy {
	#defaultTexture;
	setParams(datas) {
	}

	init() {
	}

	execute(variables, proxyParams) {
		if (!this.#defaultTexture) {
			this.#defaultTexture = variables.get('$basetexture');
		}
		if (proxyParams['customtexture']) {
			variables.set('$basetexture', proxyParams['customtexture']);
		} else {
			variables.set('$basetexture', this.#defaultTexture);
		}
	}
}
ProxyManager.registerProxy('customsteamimageonmodel', CustomSteamImageOnModel);
