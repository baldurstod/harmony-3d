import { vec3, vec4 } from 'gl-matrix';
import { DynamicParams } from '../../../entities/entity';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';
import { SourceEngineMaterial, SourceEngineMaterialParams, SourceEngineMaterialVmt, TextureRole } from './sourceenginematerial';

//TODO: deprecate
export class CharacterMaterial extends SourceEngineMaterial {
	#diffuseModulation = vec4.fromValues(1.0, 1.0, 1.0, 1.0);

	constructor(repository: string, path: string, vmt: SourceEngineMaterialVmt, params: SourceEngineMaterialParams = {}) {
		super(repository, path, vmt, params);
		const variables = this.variables;



		//"$masks1"                   models/weapons/v_models/arms/glove_bloodhound/glove_bloodhound_masks1
		//"$masks2"                   models/weapons/v_models/arms/glove_bloodhound/glove_bloodhound_masks2
		const masks1Texture = variables.get('$masks1');
		if (masks1Texture) {
			this.uniforms['mask1Map'] = this.getTexture(TextureRole.Mask, this.repository, masks1Texture, 0);
			this.setDefine('USE_MASK1_MAP');//TODOv3: set this automaticaly
		} else {
			this.removeDefine('USE_MASK1_MAP');//TODOv3: set this automaticaly
		}

		const masks2Texture = variables.get('$masks2');
		if (masks2Texture) {
			this.uniforms['mask2Map'] = this.getTexture(TextureRole.Mask2, this.repository, masks2Texture, 0);
			this.setDefine('USE_MASK2_MAP');//TODOv3: set this automaticaly
		} else {
			this.removeDefine('USE_MASK2_MAP');//TODOv3: set this automaticaly
		}



		//this.uniforms['phongfresnelranges'] = SourceEngineMaterial.readColor(parameters['$phongfresnelranges']);
		/*float fPixelFogType = pShaderAPI->GetPixelFogCombo() == 1 ? 1 : 0;
		float fWriteDepthToAlpha = bWriteDepthToAlpha && IsPC() ? 1 : 0;
		float fWriteWaterFogToDestAlpha = (pShaderAPI->GetPixelFogCombo() == 1 && bWriteWaterFogToAlpha) ? 1 : 0;
		float fVertexAlpha = bHasVertexAlpha ? 1 : 0;*/
		this.uniforms['g_ShaderControls'] = vec4.fromValues(1, 0, 1, 0);//TODOv3
		this.uniforms['g_DiffuseModulation'] = this.#diffuseModulation;

		const btbba = this.variables.get('$blendtintbybasealpha');
		if (btbba && btbba == 1) {
			this.setDefine('BLEND_TINT_BY_BASE_ALPHA');
			this.uniforms['uBlendTintColorOverBase'] = this.variables.get('$blendtintcoloroverbase') ?? 0;
		} else {
			this.removeDefine('BLEND_TINT_BY_BASE_ALPHA');
		}

		this.uniforms['g_cCloakColorTint'] = vec3.create();


		this.variables.set('$SheenMaskScaleX', 1.0);
		this.variables.set('$SheenMaskScaleY', 1.0);
		this.variables.set('$SheenMaskOffsetX', 0.0);
		this.variables.set('$SheenMaskOffsetY', 0.0);
		this.variables.set('$SheenMaskDirection', 0.0);
	}

	afterProcessProxies(proxyParams: DynamicParams = {}) {
		const variables = this.variables;
		const parameters = this.vmt;

		const sheenMapMaskFrame = variables.get('$sheenmapmaskframe');//variables.get('$sheenmapmaskframe')
		if (parameters['$sheenmapmask']) {
			this.uniforms['sheenMaskMap'] = this.getTexture(TextureRole.SheenMask, this.repository, parameters['$sheenmapmask'], sheenMapMaskFrame);
			this.setDefine('USE_SHEEN_MASK_MAP');//TODOv3: set this automaticaly

			this.uniforms['g_vPackedConst6'] = vec4.fromValues(variables.get('$SheenMaskScaleX'), variables.get('$SheenMaskScaleY'), variables.get('$SheenMaskOffsetX'), variables.get('$SheenMaskOffsetY'));
			this.uniforms['g_vPackedConst7'] = vec4.fromValues(variables.get('$SheenMaskDirection'), 0, 0, 0);
		}
		if (parameters['$sheenmap']) {
			this.uniforms['sheenMap'] = this.getTexture(TextureRole.Sheen, this.repository, parameters['$sheenmap'], 0, true);
			this.setDefine('USE_SHEEN_MAP');//TODOv3: set this automaticaly
		}

		if (proxyParams['SheenTintColor']) {
			this.uniforms['g_cCloakColorTint'] = proxyParams['SheenTintColor'];
		} else {
			const sheenmaptint = variables.get('$sheenmaptint');
			if (sheenmaptint) {
				this.uniforms['g_cCloakColorTint'] = sheenmaptint;
			}
		}

		const masks1Texture = variables.get('$masks1');
		if (masks1Texture) {
			this.uniforms['mask1Map'] = this.getTexture(TextureRole.Mask, this.repository, masks1Texture, 0);
			this.setDefine('USE_MASK1_MAP');//TODOv3: set this automaticaly
		}

		const masks2Texture = variables.get('$masks2');
		if (masks2Texture) {
			this.uniforms['mask2Map'] = this.getTexture(TextureRole.Mask2, this.repository, masks2Texture, 0);
			this.setDefine('USE_MASK2_MAP');//TODOv3: set this automaticaly
		}


		//uniform vec4 g_vPackedConst6;
		//uniform vec4 g_vPackedConst7;


		//TODOv3: only do this if a variable is changed
		this.uniforms['g_DiffuseModulation'] = this.computeModulationColor(this.#diffuseModulation);
	}

	clone() {
		return new CharacterMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	get shaderSource() {
		return 'source1_character';//TODO: setup proper shader
	}
}
SourceEngineVMTLoader.registerMaterial('character', CharacterMaterial);
