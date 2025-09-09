import { DynamicParams } from '../../../../entities/entity';
import { Source1MaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class WeaponSkin extends Proxy {
	#defaultTexture: string | null = null;

	execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number) {
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
