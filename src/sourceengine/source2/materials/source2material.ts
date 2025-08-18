import { vec4 } from 'gl-matrix';
import { DEBUG } from '../../../buildoptions';
import { RenderFace } from '../../../materials/constants';
import { Material, MATERIAL_BLENDING_ADDITIVE, MATERIAL_BLENDING_NORMAL, UniformValue } from '../../../materials/material';
import { Mesh } from '../../../objects/mesh';
import { Source2File } from '../loaders/source2file';
import { Source2TextureManager } from '../textures/source2texturemanager';
import { decompileDynamicExpression, executeDynamicExpression } from './source2dynamicexpression';

const UNIFORMS = new Map([
	['g_vColorTint', 'g_vColorTint'],
	['g_vEmissiveColor', 'g_vEmissiveColor'],
	['g_tColor', 'colorMap'],
	['g_tAmbientOcclusion', 'g_tAmbientOcclusion'],
	['g_tColorA', 'g_tColorA'],
	['g_tColorB', 'g_tColorB'],
	['g_tColorC', 'g_tColorC'],
	//['g_tDetail', 'detailMap'],
	//['g_tDetail2', 'detail2Map'],
	['g_tMasks', 'g_tMasks'],
	['g_tNormalA', 'g_tNormalA'],
	['g_tEmissiveB', 'g_tEmissiveB'],
	['g_tEmissiveC', 'g_tEmissiveC'],
	['g_flDetailBlendFactor', 'g_flDetailBlendFactor'],
	['g_flMaterialCloakFactor', 'g_flMaterialCloakFactor'],
]);

const TEXTURE_UNIFORMS = new Map<string, [string, string]>([
	['g_tColor', ['colorMap', 'USE_COLOR_MAP']],
	['TextureColor', ['colorMap', 'USE_COLOR_MAP']],
	['g_tNormal', ['normalMap', 'USE_NORMAL_MAP']],
	['g_tAmbientOcclusion', ['aoMap', 'USE_AO_MAP']],
	['g_tTintColor', ['tintColorMap', 'USE_TINT_COLOR_MAP']],
	['g_tSelfIllumFlowWaveform', ['selfIllumFlowWaveformMap', 'USE_SIFW_MAP']],
	['g_tMaskParameters', ['maskParametersMap', 'USE_MASK_PARAMETERS_MAP']],//TextureSelfIllumMask

	['g_tColorA', ['colorAMap', 'USE_COLOR_A_MAP']],
	['g_tColorB', ['colorBMap', 'USE_COLOR_B_MAP']],
	['g_tColorC', ['colorCMap', 'USE_COLOR_C_MAP']],
	['g_tColor1', ['color1Map', 'USE_COLOR_1_MAP']],
	['g_tMask', ['maskMap', 'USE_MASK_MAP']],
	['g_tNormalA', ['normalAMap', 'USE_NORMAL_A_MAP']],
	['g_tEmissiveB', ['emissiveBMap', 'USE_EMISSIVE_B_MAP']],
	['g_tEmissiveC', ['emissiveCMap', 'USE_EMISSIVE_C_MAP']],

	['g_tMasks1', ['mask1Map', 'USE_MASK1_MAP']],
	['g_tMasks2', ['mask2Map', 'USE_MASK2_MAP']],
	['g_tDetail', ['detail1Map', 'USE_DETAIL1_MAP']],
	['g_tDetail2', ['detail2Map', 'USE_DETAIL2_MAP']],

	['g_tMetalness', ['metalnessMap', 'USE_METALNESS_MAP']],

	['g_tDisplacementMask', ['displacementMaskMap', 'USE_DISPLACEMENT_MASK_MAP']],
	['g_tSpecular', ['specularMap', 'USE_SPECULAR_MAP']],
	['g_tSpiralNormal', ['spiralNormalMap', 'USE_SPIRAL_NORMAL_MAP']],
	['g_tSpiralOverlay', ['spiralOverlayMap', 'USE_SPIRAL_OVERLAY_MAP']],

	['g_tCubeMap', ['cubeMap', 'USE_CUBE_MAP']],

	['g_tNormalRoughness', ['normalMap', 'USE_NORMAL_MAP']],
	['g_tTintMaskEdgeMask', ['tintMaskEdgeMaskMap', 'USE_TINT_MASK_EDGE_MASK_MAP']],
	['g_tSelfIllumMask', ['selfIllumMaskMap', 'USE_SELF_ILLUM_MASK_MAP']],

	//g_tAnimationTexture
]);

const DEFAULT_ALPHA_TEST_REFERENCE = 0.7;

type ProxyParams = Record<string, any>;
type integer = number;
type float = number;

export class Source2Material extends Material {
	#source2File?: Source2File;
	repository: string;
	#detailTexCoordOffset = vec4.create();
	#detailTexCoordScale = vec4.create();

	constructor(repository: string, source2File?: Source2File) {
		super();
		this.repository = repository;
		this.#source2File = source2File;
		this.#setupUniforms();
		this.setupUniformsOnce();
		if (false && DEBUG && source2File) {
			//console.log(source2File!.getBlockByType('DATA')?.keyValue?.root || source2File!.getBlockByType('DATA')?.structs?.MaterialResourceData_t);
		}
	}

	setupUniformsOnce(): void {
		//TODO: F_RENDER_BACKFACES
		//F_DO_NOT_CAST_SHADOWS
		//F_MASKS_1
		//
		//---- Specular ----
		//F_MASK_CUBE_MAP_BY_METALNESS 1
		//F_SPECULAR_CUBE_MAP 1
		/*

		0: {m_name: "F_RENDER_BACKFACES", _name: "MaterialParamInt_t", m_nValue: 1}
		1: {m_name: "F_USE_STATUS_EFFECTS_PROXY", _name: "MaterialParamInt_t", m_nValue: 1}
		2: {m_name: "F_MASKS_1", _name: "MaterialParamInt_t", m_nValue: 1}
		3: {m_name: "F_MASKS_2", _name: "MaterialParamInt_t", m_nValue: 1}
		4: {m_name: "F_MORPH_SUPPORTED", _name: "MaterialParamInt_t", m_nValue: 1}
		5: {m_name: "F_SEPARATE_ALPHA_TRANSFORM", _name: "MaterialParamInt_t", m_nValue: 1}
		6: {m_name: "F_SEPARATE_NORMAL_TRANSFORM", _name: "MaterialParamInt_t", m_nValue: 1}
		7: {m_name: "F_ALPHA_TEST", _name: "MaterialParamInt_t", m_nValue: 1}
		8: {m_name: "F_DIFFUSE_WARP", _name: "MaterialParamInt_t", m_nValue: 1}
		*/
		if (this.getIntParam('F_RENDER_BACKFACES')) {
			this.renderFace(RenderFace.Both);
		}
		if (this.getIntParam('F_TRANSLUCENT')) {
			this.setBlending(MATERIAL_BLENDING_NORMAL);
			this.setDefine('IS_TRANSLUCENT');
		}

		if (this.getIntParam('F_MASKS_1')) {
			this.setDefine('USE_MASK1_MAP');
		}
		if (this.getIntParam('F_MASKS_2')) {
			this.setDefine('USE_MASK2_MAP');
		}
		if (this.getIntParam('F_ENABLE_CLOAK')) {
			this.setDefine('ENABLE_CLOAK');
		}

		if (this.getIntParam('F_ADDITIVE_BLEND')) {
			this.setBlending(MATERIAL_BLENDING_ADDITIVE);
			this.setDefine('IS_TRANSLUCENT');
		}

		if (this.getIntParam('F_ALPHA_TEST') == 1) {
			this.setDefine('ALPHA_TEST');//TODOv3: set this automaticaly
			this.uniforms['uAlphaTestReference'] = this.#getParam('g_flAlphaTestReference') ?? DEFAULT_ALPHA_TEST_REFERENCE;
		}

		if (this.getIntParam('F_SEPARATE_ALPHA_TRANSFORM')) {
			this.setDefine('USE_SEPARATE_ALPHA_TRANSFORM');
		}
		if (this.getIntParam('F_SEPARATE_NORMAL_TRANSFORM')) {
			this.setDefine('USE_SEPARATE_NORMAL_TRANSFORM');
		}

		const detailBlendMode = this.getIntParam('F_DETAIL');
		if (detailBlendMode != null) {
			this.setDefine('DETAIL_BLEND_MODE', String(detailBlendMode));
		} else {
			this.removeDefine('DETAIL_BLEND_MODE');
		}

		if (this.getIntParam('F_SELF_ILLUM') == 1) {
			this.setDefine('F_SELF_ILLUM');
		}



		this.uniforms['g_vDetailTexCoordOffset'] = this.getVectorParam('g_vDetailTexCoordOffset', this.#detailTexCoordOffset);
		this.uniforms['g_vDetailTexCoordScale'] = this.getVectorParam('g_vDetailTexCoordScale', this.#detailTexCoordScale);
		this.uniforms['g_vDetail1ColorTint'] = vec4.fromValues(1, 1, 1, 1);
		this.uniforms['g_vDetail2ColorTint'] = vec4.fromValues(1, 1, 1, 1);
		this.uniforms['g_vColorTint'] = vec4.fromValues(1, 1, 1, 0);

		this.initFloatUniforms();
		this.initVectorUniforms();
		//this.initTextureUniforms();
		/*
		0: {m_name: "g_flDetailBlendToFull", _name: "MaterialParamFloat_t", m_flValue: 0}
		1: {m_name: "g_flEnvMapBlendToFull", _name: "MaterialParamFloat_t", m_flValue: 0}
		2: {m_name: "g_flMetalnessBlendToFull", _name: "MaterialParamFloat_t", m_flValue: 0}
		3: {m_name: "g_flReflectionsTintByBaseBlendToNone", _name: "MaterialParamFloat_t", m_flValue: 0}
		4: {m_name: "g_flSelfIllumBlendToFull", _name: "MaterialParamFloat_t", m_flValue: 0}
		5: {m_name: "g_flSpecularBlendToFull", _name: "MaterialParamFloat_t", m_flValue: 0}
		6: {m_name: "g_flSpecularExponentBlendToFull", _name: "MaterialParamFloat_t", m_flValue: 0}
		7: {m_name: "g_flCloakBlurAmount", _name: "MaterialParamFloat_t", m_flValue: 0.004999999888241291}
		8: {m_name: "g_flCloakIntensity", _name: "MaterialParamFloat_t", m_flValue: 0.8500000238418579}
		9: {m_name: "g_flCloakRefractAmount", _name: "MaterialParamFloat_t", m_flValue: 0.10000000149011612}
		10: {m_name: "g_flMaterialCloakFactor", _name: "MaterialParamFloat_t", m_flValue: 0}
		11: {m_name: "g_flDiffuseModulationAmount", _name: "MaterialParamFloat_t", m_flValue: 1}
		12: {m_name: "g_flTexCoordRotation", _name: "MaterialParamFloat_t", m_flValue: 0}
		13: {m_name: "g_flDetailBlendFactor", _name: "MaterialParamFloat_t", m_flValue: 1}
		14: {m_name: "g_flDetailTexCoordRotation", _name: "MaterialParamFloat_t", m_flValue: 0}
		15: {m_name: "g_flDetail2BlendFactor", _name: "MaterialParamFloat_t", m_flValue: 0}
		16: {m_name: "g_flFresnelModulatesAlpha", _name: "MaterialParamFloat_t", m_flValue: 0}
		17: {m_name: "g_flAmbientScale", _name: "MaterialParamFloat_t", m_flValue: 1}
		18: {m_name: "g_flBloomScale", _name: "MaterialParamFloat_t", m_flValue: 0}
		19: {m_name: "g_flBloomShift", _name: "MaterialParamFloat_t", m_flValue: 0}
		20: {m_name: "g_flRimLightScale", _name: "MaterialParamFloat_t", m_flValue: 5}
		21: {m_name: "g_flCubeMapScalar", _name: "MaterialParamFloat_t", m_flValue: 5}
		22: {m_name: "g_flSpecularExponent", _name: "MaterialParamFloat_t", m_flValue: 15}
		23: {m_name: "g_flSpecularScale", _name: "MaterialParamFloat_t", m_flValue: 5}
		24: {m_name: "g_flAlphaTestReference", _name: "MaterialParamFloat_t", m_flValue: 0.5}
		*/

	}

	#setupUniforms(): void {
		for (const [paramName, uniformName] of UNIFORMS) {
			//console.error(uniformName);
			const paramValue = this.#getParam(paramName);
			if (paramValue) {
				this.setUniform(uniformName, paramValue);
			}
		}
	}

	clone(): Source2Material {
		return new (this.constructor as typeof Source2Material)(this.repository, this.#source2File);
	}

	getTextureParam(textureName: string): string | null {
		if (this.#source2File) {
			//TODO: use getMaterialResourceData()
			const textures = this.#source2File.getBlockStructAsElementArray('DATA', 'MaterialResourceData_t.m_textureParams') ?? this.#source2File.getBlockStructAsElementArray('DATA', 'm_textureParams');
			if (textures) {
				for (const texture of textures) {
					if (texture.getValueAsString('m_name') == textureName) {
						return texture.getValueAsResource('m_pValue');
					}
				}
			}
		}
		return null;
	}

	updateMaterial(time: number, mesh: Mesh): void {
		this.processProxies(time, mesh.materialsParams);
	}

	processProxies(time: number, proxyParams: ProxyParams): void {
		//todov3//rename function

		/*let proxies = this.proxies;
		for (let proxyIndex = 0, l = proxies.length; proxyIndex < l; ++proxyIndex) {
			proxies[proxyIndex].execute(this.variables, this.proxyParams, time);
		}*/
		this._afterProcessProxies(proxyParams);
		this.afterProcessProxies(proxyParams);
	}

	_afterProcessProxies(proxyParams: ProxyParams): void {
		//this.setupUniforms();
		this.initTextureUniforms();//TODO : do this only once
		/*
				let g_tMasks1 = this.getTextureByName('g_tMasks1');
				if (g_tMasks1) {
					this.uniforms['mask1Map'] = Source2TextureManager.getTexture(this.repository, g_tMasks1, 0);//TODOv3: rename uniform
				}

				let g_tMasks2 = this.getTextureByName('g_tMasks2');
				if (g_tMasks2) {
					this.uniforms['mask2Map'] = Source2TextureManager.getTexture(this.repository, g_tMasks2, 0);//TODOv3: rename uniform
				}

				let g_tDetail = this.getTextureByName('g_tDetail');
				if (g_tDetail) {
					this.uniforms['detail1Map'] = Source2TextureManager.getTexture(this.repository, g_tDetail, 0);//TODOv3: rename uniform
					this.setDefine('USE_DETAIL1_MAP');//TODOv3: set this automaticaly
				} else {
					//this.uniforms['detail1Map'] = TextureManager.createCheckerTexture();
					this.setDefine('USE_DETAIL1_MAP', false);//TODOv3: set this automaticaly
				}

				let g_tDetail2 = this.getTextureByName('g_tDetail2');
				if (g_tDetail2) {
					this.uniforms['detail2Map'] = Source2TextureManager.getTexture(this.repository, g_tDetail2, 0);//TODOv3: rename uniform
					this.setDefine('USE_DETAIL2_MAP');//TODOv3: set this automaticaly
				} else {
					this.setDefine('USE_DETAIL2_MAP', false);//TODOv3: set this automaticaly
				}*/

		//TODO: only do what is in m_dynamicParams
		this.setDynamicUniform('g_vDetailTexCoordOffset');
		this.setDynamicUniform('g_vDetailTexCoordScale');
		this.setDynamicUniform('g_vAlphaTexCoordOffset');
		this.setDynamicUniform('g_flDetailBlendFactor');
		this.setDynamicUniform('g_flDetailTexCoordRotation');
		this.setDynamicUniform('g_vDetail1ColorTint');
		this.setDynamicUniform('g_vSpecularColor');
		//this.setDynamicUniform('g_vNormalTexCoordOffset');


	}

	setDynamicUniform(uniformName: string): void {
		const value = this.getDynamicParam(uniformName);
		if (value) {
			if (uniformName.startsWith('g_fl')) {
				this.uniforms[uniformName] = value[0];
			} else {
				this.uniforms[uniformName] = value;
			}
		}
	}

	afterProcessProxies(proxyParams: ProxyParams): void {

	}

	setUniform(uniformName: string, uniformValue: UniformValue): void {
		this.uniforms[uniformName] = uniformValue;
	}

	initFloatUniforms(): void {
		if (this.#source2File) {
			const floats = this.#source2File.getMaterialResourceData('m_floatParams');
			if (floats) {
				for (const fl of floats) {
					const name = fl.getValueAsString('m_name');
					const value = fl.getValueAsNumber('m_flValue');

					if (name !== null && value !== null) {
						this.setUniform(name, value);
					}
				}
			}
		}
	}

	initVectorUniforms(): void {
		if (this.#source2File) {
			const vectors = this.#source2File.getMaterialResourceData('m_vectorParams');
			if (vectors) {
				for (const vector of vectors) {
					const name = vector.getValueAsString('m_name');
					const value = vector.getValueAsVec4('m_value', vec4.create());

					if (name !== null && value !== null) {
						this.setUniform(name, value);
					}
				}
			}
		}
	}

	getUniforms(): Map<string, string>[] {
		return [UNIFORMS];
	}

	getTextureUniforms(): Map<string, [string, string]>[] {
		return [TEXTURE_UNIFORMS];
	}

	async initTextureUniforms(): Promise<void> {
		for (const map of this.getTextureUniforms()) {
			for (const [paramName, [uniformName, defineName]] of map) {
				const paramValue = this.getTextureParam(paramName);
				if (paramValue) {
					this.setTexture(uniformName, paramValue ? await Source2TextureManager.getTexture(this.repository, paramValue, 0) : null, defineName);
				}
			}
		}
	}

	#getParam(paramName: string): number | vec4 | null {
		if (paramName.startsWith('g_f')) {
			return this.getFloatParam(paramName);
		} else if (paramName.startsWith('g_v')) {
			return this.getVectorParam(paramName, vec4.create()/*TODO: optimize*/);
		} else if (paramName.startsWith('g_n')) {
			return this.getIntParam(paramName);
		}/* else if (paramName.startsWith('g_t')) {
			let textureName = this.getTextureByName(paramName);
			if (textureName) {
				return Source2TextureManager.getTexture(this.repository, textureName, 0);
			} else {
				return null;//TODO: disable texture;
			}
		}*/
		return null;
		console.error(`unknown parameter : ${paramName}`, this);
	}

	#getParams(name: string, isFloat: boolean, isVector: boolean, isResource: boolean): Map<string, number | string | vec4> | null {
		if (!this.#source2File) {
			return null;
		}

		const values = this.#source2File.getBlockStructAsElementArray('DATA', 'MaterialResourceData_t.' + name) ?? this.#source2File.getBlockStructAsElementArray('DATA', name);
		if (!values) {
			return null;
		}

		const result = new Map<string, integer | string | vec4>();
		for (const v of values) {
			const name = v.getSubValueAsString('m_name');
			const value = isFloat ? v.getSubValueAsNumber('m_flValue') : isVector ? v.getSubValueAsVec4('m_value', vec4.create()) : isResource ? v.getSubValueAsResource('m_pValue') : v.getSubValueAsNumber('m_nValue');

			if (name && value != null) {
				result.set(name, value);
			}
		}
		return result;
	}

	getIntParam(intName: string): number | null {
		if (!this.#source2File) {
			return null;
		}

		const ints = this.#source2File.getBlockStructAsElementArray('DATA', 'MaterialResourceData_t.m_intParams') ?? this.#source2File.getBlockStructAsElementArray('DATA', 'm_intParams');
		if (ints) {
			for (const int of ints) {
				if (int.getSubValueAsString('m_name') == intName) {
					return int.getSubValueAsNumber('m_nValue');
				}
			}
		}
		return null;
	}

	getIntParams(): Map<string, integer> | null {
		return this.#getParams('m_intParams', false, false, false) as Map<string, integer>;
	}

	getFloatParam(floatName: string): number | null {
		if (!this.#source2File) {
			return null;
		}
		const floats = this.#source2File.getBlockStructAsElementArray('DATA', 'MaterialResourceData_t.m_floatParams') ?? this.#source2File.getBlockStructAsElementArray('DATA', 'm_floatParams');
		if (floats) {
			for (const fl of floats) {
				if (fl.getSubValueAsString('m_name') == floatName) {
					return fl.getSubValueAsNumber('m_flValue');
				}
			}
		}
		return null;
	}

	getFloatParams(): Map<string, float> | null {
		return this.#getParams('m_floatParams', true, false, false) as Map<string, integer>;
	}

	getVectorParam(vectorName: string, out: vec4): vec4 | null {
		if (this.#source2File) {
			const vectors = this.#source2File.getBlockStructAsElementArray('DATA', 'MaterialResourceData_t.m_vectorParams') ?? this.#source2File.getBlockStructAsElementArray('DATA', 'm_vectorParams');
			if (vectors) {
				for (const vector of vectors) {
					if (vector.getSubValueAsString('m_name') == vectorName) {
						vector.getSubValueAsVec4('m_value', out);
						return out;
					}
				}
			}
		}
		return null;
	}

	getVectorParams(): Map<string, vec4> | null {
		return this.#getParams('m_vectorParams', false, true, false) as Map<string, vec4>;
	}

	#getDynamicParam(name: string): Uint8Array | null {
		const dynamicParams = this.#source2File!.getBlockStructAsElementArray('DATA', 'MaterialResourceData_t.m_dynamicParams') ?? this.#source2File!.getBlockStructAsElementArray('DATA', 'm_dynamicParams');// || this.#source2File.getBlockStruct('DATA.keyValue.root.m_dynamicParams');
		if (!dynamicParams) {
			return null;
		}
		for (const dynamicParam of dynamicParams) {
			if (dynamicParam.getSubValueAsString('m_name') == name) {
				const bytes = dynamicParam.getSubValueAsUint8Array('m_value');
				if (bytes) {
					return bytes;
				}
			}
		}
		return null;
	}

	getDynamicParam(name: string): vec4 | null {
		if (!this.#source2File) {
			return null;
		}
		const bytes = this.#getDynamicParam(name);
		if (bytes) {
			return executeDynamicExpression(bytes, this.#source2File.getBlockStructAsStringArray('DATA', 'MaterialResourceData_t.m_renderAttributesUsed') ?? this.#source2File.getBlockStructAsStringArray('DATA', 'm_renderAttributesUsed') ?? []) ?? null;
		}
		return null;
	}

	getDecompiledDynamicParam(name: string): [string | null, Uint8Array] | null {
		if (!this.#source2File) {
			return null;
		}
		const bytes = this.#getDynamicParam(name);
		if (bytes) {
			return [decompileDynamicExpression(this.#source2File.fileName + ':' + name, bytes, this.#source2File.getBlockStructAsStringArray('DATA', 'MaterialResourceData_t.m_renderAttributesUsed') ?? this.#source2File.getBlockStructAsStringArray('DATA', 'm_renderAttributesUsed') ?? []), bytes]
		}
		return null;
	}

	getDynamicParams(): Map<string, [string | null, Uint8Array]> | null {
		if (!this.#source2File) {
			return null;
		}

		const values = this.#source2File.getBlockStructAsElementArray('DATA', 'MaterialResourceData_t.m_dynamicParams') ?? this.#source2File.getBlockStructAsElementArray('DATA', 'm_dynamicParams');
		if (!values) {
			return null;
		}

		const result = new Map<string, [string | null, Uint8Array]>();
		for (const v of values) {
			const name = v.getSubValueAsString('m_name');
			const value = v.getSubValueAsUint8Array('m_value');

			if (name && value != null) {
				result.set(name, [decompileDynamicExpression(this.#source2File.fileName + ':' + name, value, this.#source2File.getBlockStructAsStringArray('DATA', 'MaterialResourceData_t.m_renderAttributesUsed') ?? this.#source2File.getBlockStructAsStringArray('DATA', 'm_renderAttributesUsed') ?? []), value]);
			}
		}
		return result;
	}

	getTextureParams(): Map<string, string> | null {
		return this.#getParams('m_textureParams', false, false, true) as Map<string, string>;
	}
}
