import { DynamicParams } from '../../../../entities/entity';
import { SourceEngineMaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class WeaponSkin extends Proxy {
	#defaultTexture = null;

	execute(variables: Map<string, SourceEngineMaterialVariables>, proxyParams: DynamicParams, time: number) {
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
