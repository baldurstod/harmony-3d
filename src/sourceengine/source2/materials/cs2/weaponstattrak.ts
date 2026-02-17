import { DynamicParams } from '../../../../entities/entity';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';
import { Source2Material } from '../source2material';

export class Source2CsgoWeaponStattrak extends Source2Material {

	_afterProcessProxies(proxyParams: DynamicParams) {
		//Proxy param: $ent_stattrak
		super._afterProcessProxies(proxyParams);
		this.setDynamicUniform('g_nStatTrakValue');
	}

	override get shaderSource(): string {
		return 'source2_csgo_weapon_stattrak';
	}
}
Source2MaterialLoader.registerMaterial('csgo_weapon_stattrak.vfx', Source2CsgoWeaponStattrak);
