import { vec3, vec4 } from 'gl-matrix';
import { DynamicParams } from '../../../entities/entity';
import { MATERIAL_BLENDING_ADDITIVE, MATERIAL_BLENDING_NONE } from '../../../materials/material';
import { Source1VmtLoader } from '../loaders/source1vmtloader';
import { Source1Material, Source1MaterialParams, Source1MaterialVmt, TextureRole } from './source1material';

export class VertexLitGenericMaterial extends Source1Material {
	#diffuseModulation = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
	#initialized = false;
	useSrgb = false;

	init(): void {
		if (this.#initialized) {
			return;
		}
		this.#initialized = true;
		super.init();


		//this.uniforms['phongfresnelranges'] = Source1Material.readColor(parameters['$phongfresnelranges']);
		/*float fPixelFogType = pShaderAPI->GetPixelFogCombo() == 1 ? 1 : 0;
		float fWriteDepthToAlpha = bWriteDepthToAlpha && IsPC() ? 1 : 0;
		float fWriteWaterFogToDestAlpha = (pShaderAPI->GetPixelFogCombo() == 1 && bWriteWaterFogToAlpha) ? 1 : 0;
		float fVertexAlpha = bHasVertexAlpha ? 1 : 0;*/
		this.uniforms['g_ShaderControls'] = vec4.fromValues(1, 0, 1, 0);//TODOv3
		this.uniforms['g_DiffuseModulation'] = this.#diffuseModulation;

		const btbba = this.variables.get('$blendtintbybasealpha');
		if (btbba == 1) {
			this.alphaTest = false;
			this.variables.set('$alphatest', 0);
			if (this.variables.get('$selfillum') != 1) {
				this.removeDefine('USE_SELF_ILLUM');
				this.setDefine('BLEND_TINT_BY_BASE_ALPHA');
				this.uniforms['uBlendTintColorOverBase'] = this.variables.get('$blendtintcoloroverbase') ?? 0;

				// TODO : properly set these variables
				this.variables.set('$translucent', 0);
				this.removeDefine('ALPHA_TEST');
				this.setBlending(MATERIAL_BLENDING_NONE);
				this.removeDefine('IS_TRANSLUCENT');

				if (this.variables.get('$additive') == 1) {
					this.setBlending(MATERIAL_BLENDING_ADDITIVE, true);
				}
			}
			//TODO end
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

	afterProcessProxies(proxyParams: DynamicParams) {
		const variables = this.variables;
		const parameters = this.vmt;

		const sheenMapMaskFrame = variables.get('$sheenmapmaskframe');//variables.get('$sheenmapmaskframe')
		if (parameters['$sheenmapmask']) {
			this.setTexture('sheenMaskTexture', this.getTexture(TextureRole.SheenMask, this.repository, parameters['$sheenmapmask'], sheenMapMaskFrame), 'USE_SHEEN_MASK_MAP');

			this.uniforms['g_vPackedConst6'] = vec4.fromValues(variables.get('$SheenMaskScaleX'), variables.get('$SheenMaskScaleY'), variables.get('$SheenMaskOffsetX'), variables.get('$SheenMaskOffsetY'));
			this.uniforms['g_vPackedConst7'] = vec4.fromValues(variables.get('$SheenMaskDirection'), 0, 0, 0);
		}
		if (parameters['$sheenmap']) {
			this.setTexture('sheenTexture', this.getTexture(TextureRole.Sheen, this.repository, parameters['$sheenmap'], 0, true), 'USE_SHEEN_MAP');
		}

		if (proxyParams['SheenTintColor']) {
			this.uniforms['g_cCloakColorTint'] = proxyParams['SheenTintColor'];
		} else {
			const sheenmaptint = variables.get('$sheenmaptint');
			if (sheenmaptint) {
				this.uniforms['g_cCloakColorTint'] = sheenmaptint;
			}
		}


		//uniform vec4 g_vPackedConst6;
		//uniform vec4 g_vPackedConst7;


		//TODOv3: only do this if a variable is changed
		this.uniforms['g_DiffuseModulation'] = this.computeModulationColor(this.#diffuseModulation);
	}

	clone() {
		return new VertexLitGenericMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	get shaderSource() {
		return 'source1_vertexlitgeneric';
	}
}
Source1VmtLoader.registerMaterial('vertexlitgeneric', VertexLitGenericMaterial);
//MaterialManager.registerMaterial('VertexLitGeneric', VertexLitGenericMaterial, Source1MaterialManager);
