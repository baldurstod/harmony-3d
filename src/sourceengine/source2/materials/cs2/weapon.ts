import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

const STICKER_COUNT = 5;

class WeaponSticker {
	sticker: string = '';
	holoSpectrum: string = '';
	normalRoughness: string = '';
	sfxMask: string = '';
}

export class Source2CsgoWeapon extends Source2Material {
	#enableStickers: boolean = false;

	setupUniformsOnce() {
		super.setupUniformsOnce();
		if (this.getIntParam('F_STICKERS')) {
			this.setDefine('ENABLE_STICKERS');
			this.#enableStickers = true;
		}

		for (let i = 0; i < STICKER_COUNT; i++) {
			if (this.getIntParam(`g_bEnableSticker${i}`)) {
				this.setDefine(`ENABLE_STICKER${i}`);
			}
		}
	}

	getTextureUniforms(): Array<Map<string, Array<string>>> {
		const uniforms = super.getTextureUniforms();
		const m: Map<string, Array<string>> = new Map();

		for (let i = 0; i < STICKER_COUNT; i++) {
			m.set(`g_tHoloSpectrumSticker${i}`, [`holoSpectrumSticker${i}`, `USE_HOLO_SPECTRUM_STICKER${i}_MAP`]);
			m.set(`g_tNormalRoughnessSticker${i}`, [`normalRoughnessSticker${i}`, `USE_NORMAL_ROUGHNESS_STICKER${i}_MAP`]);
			m.set(`g_tSfxMaskSticker${i}`, [`sfxMaskSticker${i}`, `USE_SFX_MASK_STICKER${i}_MAP`]);
			m.set(`g_tSticker${i}`, [`sticker${i}`, `USE_STICKER${i}_MAP`]);
		}

		uniforms.push(m);
		return uniforms;
	}

	get shaderSource() {
		return 'source2_csgo_weapon';
	}
}
Source2MaterialLoader.registerMaterial('csgo_weapon.vfx', Source2CsgoWeapon);
