import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';
import { TESTING } from '../../../../buildoptions';

export class Source2CsgoWeaponStattrak extends Source2Material{

	_afterProcessProxies(proxyParams) {
		//Proxy param: $ent_stattrak
		super._afterProcessProxies(proxyParams);
		this.setDynamicUniform('g_nStatTrakValue');
	}

	get shaderSource() {
		return 'source2_csgo_weapon_stattrak';
	}
}
Source2MaterialLoader.registerMaterial('csgo_weapon_stattrak.vfx', Source2CsgoWeaponStattrak);
