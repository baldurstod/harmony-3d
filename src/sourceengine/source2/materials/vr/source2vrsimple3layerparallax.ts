import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2VrSimple3LayerParallax extends Source2Material{

	override get shaderSource(): string {
		return 'source2_vr_simple_3layer_parallax';
	}
}
Source2MaterialLoader.registerMaterial('vr_simple_3layer_parallax.vfx', Source2VrSimple3LayerParallax);


/*

m_textureParams: Array(7)
0: {m_name: "g_tNormalA", _name: "MaterialParamTexture_t", m_pValue: "models/weapons/vr_alyxtool/materials/multi_screen_r_normal_psd_fd9ddafa.vtex"}
1: {m_name: "g_tColorC", _name: "MaterialParamTexture_t", m_pValue: "models/weapons/vr_alyxtool/materials/multitool_screen_r_vmat_g_tcolorc_79c08dd3.vtex"}
2: {m_name: "g_tColorB", _name: "MaterialParamTexture_t", m_pValue: "models/weapons/vr_alyxtool/materials/multitool_screen_r_vmat_g_tcolorb_9bba1794.vtex"}
3: {m_name: "g_tEmissiveB", _name: "MaterialParamTexture_t", m_pValue: "materials/default/default_tga_449484c6.vtex"}
4: {m_name: "g_tEmissiveC", _name: "MaterialParamTexture_t", m_pValue: "materials/default/default_tga_449484c6.vtex"}
5: {m_name: "g_tMasks", _name: "MaterialParamTexture_t", m_pValue: "models/weapons/vr_alyxtool/materials/multi_screen_r_mask_psd_255bc5b7.vtex"}
6: {m_name: "g_tColorA", _name: "MaterialParamTexture_t", m_pValue: "models/weapons/vr_alyxtool/materials/multi_screen_r_color_psd_4f0a4fd7.vtex"}
*/
