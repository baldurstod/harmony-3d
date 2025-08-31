import { DynamicParams } from '../../../../entities/entity';
import { SourceEngineMaterialVariables } from '../sourceenginematerial';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

/**
 * CustomSteamImageOnModel proxy.
 * @comment ouput variable name: resultVar
 */
export class CustomSteamImageOnModel extends Proxy {
	#defaultTexture = '';

	execute(variables: Map<string, SourceEngineMaterialVariables>, proxyParams: DynamicParams, time: number) {
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
