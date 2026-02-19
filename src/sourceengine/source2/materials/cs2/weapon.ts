import { Source2MaterialLoader } from '../../loaders/source2materialloader';
import { Source2Material } from '../source2material';

const STICKER_COUNT = 5;

class WeaponSticker {
	sticker = '';
	holoSpectrum = '';
	normalRoughness = '';
	sfxMask = '';
}

export class Source2CsgoWeapon extends Source2Material {

	setupUniformsOnce(): void {
		super.setupUniformsOnce();
		if (this.getIntParam('F_STICKERS')) {
			this.setDefine('ENABLE_STICKERS');
		}

		for (let i = 0; i < STICKER_COUNT; i++) {
			//if (this.getIntParam(`g_bEnableSticker${i}`)) {
			this.setDefine(`ENABLE_STICKER${i}`);
			//}
		}
	}

	getUniforms(): Map<string, string>[] {
		const uniforms = super.getUniforms();
		const m = new Map<string, string>();

		for (let i = 0; i < STICKER_COUNT; i++) {
			m.set(`g_flSticker${i}Rotation`, `g_flSticker${i}Rotation`);
			m.set(`g_flSticker${i}Wear`, `g_flSticker${i}Wear`);
			m.set(`g_fWearScratchesSticker${i}`, `g_fWearScratchesSticker${i}`);
			m.set(`g_vSticker${i}Offset`, `g_vSticker${i}Offset`);
			m.set(`g_vSticker${i}Scale`, `g_vSticker${i}Scale`);
			m.set(`g_vWearBiasSticker${i}`, `g_vWearBiasSticker${i}`);
		}

		uniforms.push(m);
		return uniforms;
	}

	getTextureUniforms(): Map<string, [string, string]>[] {
		const uniforms = super.getTextureUniforms();
		const m = new Map<string, [string, string]>();

		for (let i = 0; i < STICKER_COUNT; i++) {
			m.set(`g_tHoloSpectrumSticker${i}`, [`holoSpectrumSticker${i}Map`, `USE_HOLO_SPECTRUM_STICKER${i}_MAP`]);
			m.set(`g_tNormalRoughnessSticker${i}`, [`normalRoughnessSticker${i}Map`, `USE_NORMAL_ROUGHNESS_STICKER${i}_MAP`]);
			m.set(`g_tSfxMaskSticker${i}`, [`sfxMaskSticker${i}Map`, `USE_SFX_MASK_STICKER${i}_MAP`]);
			m.set(`g_tSticker${i}`, [`sticker${i}Map`, `USE_STICKER${i}_MAP`]);
		}

		m.set('g_tStickerWepInputs', [`stickerWepInputsMap`, `USE_STICKER_WEP_INPUT_MAP`]);

		uniforms.push(m);
		return uniforms;
	}

	override get shaderSource(): string {
		return 'source2_csgo_weapon';
	}
}
Source2MaterialLoader.registerMaterial('csgo_weapon.vfx', Source2CsgoWeapon);

/*
{
	"m_materialName": "materials/models/weapons/v_models/rif_ak47/ak47.vmat",
	"m_shaderName": "csgo_weapon.vfx",
	"m_intParams": [
		{
			"m_name": "F_STICKERS",
			"m_nValue": 1
		},
		{
			"m_name": "g_bEnableSticker0",
			"m_nValue": 0
		},
		{
			"m_name": "g_bEnableSticker1",
			"m_nValue": 0
		},
		{
			"m_name": "g_bEnableSticker2",
			"m_nValue": 0
		},
		{
			"m_name": "g_bEnableSticker3",
			"m_nValue": 0
		},
		{
			"m_name": "g_bEnableSticker4",
			"m_nValue": 0
		},
		{
			"m_name": "g_bFogEnabled",
			"m_nValue": 1
		},
		{
			"m_name": "g_nScaleTexCoordUByModelScaleAxis",
			"m_nValue": 0
		},
		{
			"m_name": "g_nScaleTexCoordVByModelScaleAxis",
			"m_nValue": 0
		},
		{
			"m_name": "g_nTextureAddressModeU",
			"m_nValue": 0
		},
		{
			"m_name": "g_nTextureAddressModeV",
			"m_nValue": 0
		}
	],
	"m_floatParams": [
		{
			"m_name": "g_flMetalnessTransitionBias",
			"m_flValue": 2
		},
		{
			"m_name": "g_flModelTintAmount",
			"m_flValue": 1
		},
		{
			"m_name": "g_flSticker0Rotation",
			"m_flValue": 0
		},
		{
			"m_name": "g_flSticker0Wear",
			"m_flValue": 0
		},
		{
			"m_name": "g_flSticker1Rotation",
			"m_flValue": 0
		},
		{
			"m_name": "g_flSticker1Wear",
			"m_flValue": 0
		},
		{
			"m_name": "g_flSticker2Rotation",
			"m_flValue": 0
		},
		{
			"m_name": "g_flSticker2Wear",
			"m_flValue": 0
		},
		{
			"m_name": "g_flSticker3Rotation",
			"m_flValue": 0
		},
		{
			"m_name": "g_flSticker3Wear",
			"m_flValue": 0
		},
		{
			"m_name": "g_flSticker4Rotation",
			"m_flValue": 0
		},
		{
			"m_name": "g_flSticker4Wear",
			"m_flValue": 0
		},
		{
			"m_name": "g_flTexCoordRotation",
			"m_flValue": 0
		},
		{
			"m_name": "g_fWearScratchesSticker0",
			"m_flValue": 1
		},
		{
			"m_name": "g_fWearScratchesSticker1",
			"m_flValue": 1
		},
		{
			"m_name": "g_fWearScratchesSticker2",
			"m_flValue": 1
		},
		{
			"m_name": "g_fWearScratchesSticker3",
			"m_flValue": 1
		},
		{
			"m_name": "g_fWearScratchesSticker4",
			"m_flValue": 1
		}
	],
	"m_vectorParams": [
		{
			"m_name": "g_vColorTint",
			"m_value": [
				1,
				1,
				1,
				0
			]
		},
		{
			"m_name": "g_vMetalnessRemapRange",
			"m_value": [
				0,
				1,
				0,
				0
			]
		},
		{
			"m_name": "g_vSticker0Offset",
			"m_value": [
				0.15399999916553497,
				-0.43799999356269836,
				0,
				0
			]
		},
		{
			"m_name": "g_vSticker0Scale",
			"m_value": [
				15.350000381469727,
				15.350000381469727,
				0,
				0
			]
		},
		{
			"m_name": "g_vSticker1Offset",
			"m_value": [
				0.06499999761581421,
				-0.4320000112056732,
				0,
				0
			]
		},
		{
			"m_name": "g_vSticker1Scale",
			"m_value": [
				15.350000381469727,
				15.350000381469727,
				0,
				0
			]
		},
		{
			"m_name": "g_vSticker2Offset",
			"m_value": [
				-0.03200000151991844,
				-0.43799999356269836,
				0,
				0
			]
		},
		{
			"m_name": "g_vSticker2Scale",
			"m_value": [
				15.350000381469727,
				15.350000381469727,
				0,
				0
			]
		},
		{
			"m_name": "g_vSticker3Offset",
			"m_value": [
				-0.164000004529953,
				-0.4440000057220459,
				0,
				0
			]
		},
		{
			"m_name": "g_vSticker3Scale",
			"m_value": [
				15.350000381469727,
				15.350000381469727,
				0,
				0
			]
		},
		{
			"m_name": "g_vSticker4Offset",
			"m_value": [
				0,
				0,
				0,
				0
			]
		},
		{
			"m_name": "g_vSticker4Scale",
			"m_value": [
				0,
				0,
				0,
				0
			]
		},
		{
			"m_name": "g_vTexCoordCenter",
			"m_value": [
				0.5,
				0.5,
				0,
				0
			]
		},
		{
			"m_name": "g_vTexCoordOffset",
			"m_value": [
				0,
				0,
				0,
				0
			]
		},
		{
			"m_name": "g_vTexCoordScale",
			"m_value": [
				1,
				1,
				0,
				0
			]
		},
		{
			"m_name": "g_vTexCoordScrollSpeed",
			"m_value": [
				0,
				0,
				0,
				0
			]
		},
		{
			"m_name": "g_vWearBiasSticker0",
			"m_value": [
				1,
				1,
				0,
				0
			]
		},
		{
			"m_name": "g_vWearBiasSticker1",
			"m_value": [
				1,
				1,
				0,
				0
			]
		},
		{
			"m_name": "g_vWearBiasSticker2",
			"m_value": [
				1,
				1,
				0,
				0
			]
		},
		{
			"m_name": "g_vWearBiasSticker3",
			"m_value": [
				1,
				1,
				0,
				0
			]
		},
		{
			"m_name": "g_vWearBiasSticker4",
			"m_value": [
				1,
				1,
				0,
				0
			]
		}
	],
	"m_textureParams": [
		{
			"m_name": "g_tAmbientOcclusion",
			"m_pValue": "materials/models/weapons/v_models/rif_ak47/ak47_ao_psd_286fb1af.vtex"
		},
		{
			"m_name": "g_tColor",
			"m_pValue": "materials/models/weapons/v_models/rif_ak47/ak47_color_psd_1f318532.vtex"
		},
		{
			"m_name": "g_tHoloSpectrumSticker0",
			"m_pValue": "materials/default/stickers/default_holospectrum_tga_e12c79bd.vtex"
		},
		{
			"m_name": "g_tHoloSpectrumSticker1",
			"m_pValue": "materials/default/stickers/default_holospectrum_tga_e12c79bd.vtex"
		},
		{
			"m_name": "g_tHoloSpectrumSticker2",
			"m_pValue": "materials/default/stickers/default_holospectrum_tga_e12c79bd.vtex"
		},
		{
			"m_name": "g_tHoloSpectrumSticker3",
			"m_pValue": "materials/default/stickers/default_holospectrum_tga_e12c79bd.vtex"
		},
		{
			"m_name": "g_tHoloSpectrumSticker4",
			"m_pValue": "materials/default/stickers/default_holospectrum_tga_e12c79bd.vtex"
		},
		{
			"m_name": "g_tMetalness",
			"m_pValue": "materials/models/weapons/v_models/rif_ak47/ak47_rough_psd_73589151.vtex"
		},
		{
			"m_name": "g_tNormal",
			"m_pValue": "materials/models/weapons/v_models/rif_ak47/ak47_normal_psd_57f37ac9.vtex"
		},
		{
			"m_name": "g_tNormalRoughnessSticker0",
			"m_pValue": "materials/default/default_normal_tga_4c6e7391.vtex"
		},
		{
			"m_name": "g_tNormalRoughnessSticker1",
			"m_pValue": "materials/default/default_normal_tga_4c6e7391.vtex"
		},
		{
			"m_name": "g_tNormalRoughnessSticker2",
			"m_pValue": "materials/default/default_normal_tga_4c6e7391.vtex"
		},
		{
			"m_name": "g_tNormalRoughnessSticker3",
			"m_pValue": "materials/default/default_normal_tga_4c6e7391.vtex"
		},
		{
			"m_name": "g_tNormalRoughnessSticker4",
			"m_pValue": "materials/default/default_normal_tga_4c6e7391.vtex"
		},
		{
			"m_name": "g_tSfxMaskSticker0",
			"m_pValue": "materials/default/stickers/default_holomask_tga_daef1ed1.vtex"
		},
		{
			"m_name": "g_tSfxMaskSticker1",
			"m_pValue": "materials/default/stickers/default_holomask_tga_daef1ed1.vtex"
		},
		{
			"m_name": "g_tSfxMaskSticker2",
			"m_pValue": "materials/default/stickers/default_holomask_tga_daef1ed1.vtex"
		},
		{
			"m_name": "g_tSfxMaskSticker3",
			"m_pValue": "materials/default/stickers/default_holomask_tga_daef1ed1.vtex"
		},
		{
			"m_name": "g_tSfxMaskSticker4",
			"m_pValue": "materials/default/stickers/default_holomask_tga_daef1ed1.vtex"
		},
		{
			"m_name": "g_tSticker0",
			"m_pValue": "materials/default/stickers/sticker_default_psd_7f7731d3.vtex"
		},
		{
			"m_name": "g_tSticker1",
			"m_pValue": "materials/default/stickers/sticker_default_psd_7f7731d3.vtex"
		},
		{
			"m_name": "g_tSticker2",
			"m_pValue": "materials/default/stickers/sticker_default_psd_7f7731d3.vtex"
		},
		{
			"m_name": "g_tSticker3",
			"m_pValue": "materials/default/stickers/sticker_default_psd_7f7731d3.vtex"
		},
		{
			"m_name": "g_tSticker4",
			"m_pValue": "materials/default/stickers/sticker_default_psd_7f7731d3.vtex"
		},
		{
			"m_name": "g_tStickerGlitterNormal",
			"m_pValue": "materials/default/stickers/squares_glitter_normal_tga_25145674.vtex"
		},
		{
			"m_name": "g_tStickerScratches",
			"m_pValue": "materials/default/stickers/sticker_default_scratches_psd_a9ad199b.vtex"
		},
		{
			"m_name": "g_tStickerWepInputs",
			"m_pValue": "weapons/models/ak47/materials/stickers/weapon_rif_ak47_sticker_mask_legacy_tga_1bdb00a.vtex"
		}
	],
	"m_dynamicParams": [],
	"m_dynamicTextureParams": [],
	"m_intAttributes": [],
	"m_floatAttributes": [],
	"m_vectorAttributes": [],
	"m_textureAttributes": [],
	"m_stringAttributes": [
		{
			"m_name": "composite_inputs",
			"m_value": "materials/models/weapons/customization/rif_ak47/rif_ak47_composite_inputs.vmat"
		},
		{
			"m_name": "PreviewModel",
			"m_value": "weapons/models/ak47/weapon_rif_ak47.vmdl"
		}
	],
	"m_renderAttributesUsed": []
}
*/
