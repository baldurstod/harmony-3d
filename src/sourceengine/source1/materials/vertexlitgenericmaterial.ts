import { vec3, vec4 } from 'gl-matrix';

import { SourceEngineMaterial } from './sourceenginematerial';
import { SourceEngineMaterialManager } from './sourceenginematerialmanager';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';
import { Source1TextureManager } from '../textures/source1texturemanager';
import { MATERIAL_BLENDING_NONE, MATERIAL_BLENDING_ADDITIVE } from '../../../materials/material';
import { MaterialManager } from '../../../materials/materialmanager';

export class VertexLitGenericMaterial extends SourceEngineMaterial {
	diffuseModulation = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
	constructor(params: any = {}) {
		params.useSrgb = false;
		super(params/*repository, fileName, parameters*/);
		this.setValues(params);


		//this.uniforms['phongfresnelranges'] = SourceEngineMaterial.readColor(parameters['$phongfresnelranges']);
		/*float fPixelFogType = pShaderAPI->GetPixelFogCombo() == 1 ? 1 : 0;
		float fWriteDepthToAlpha = bWriteDepthToAlpha && IsPC() ? 1 : 0;
		float fWriteWaterFogToDestAlpha = (pShaderAPI->GetPixelFogCombo() == 1 && bWriteWaterFogToAlpha) ? 1 : 0;
		float fVertexAlpha = bHasVertexAlpha ? 1 : 0;*/
		this.uniforms['g_ShaderControls'] = vec4.fromValues(1, 0, 1, 0);//TODOv3
		this.uniforms['g_DiffuseModulation'] = this.diffuseModulation;

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

	afterProcessProxies(proxyParams) {
		let variables = this.variables;
		let parameters = this.parameters;

		const sheenMapMaskFrame = variables.get('$sheenmapmaskframe');//variables.get('$sheenmapmaskframe')
		if (parameters['$sheenmapmask']) {
			this.setTexture('sheenMaskMap', Source1TextureManager.getTexture(this.repository, parameters['$sheenmapmask'], sheenMapMaskFrame), 'USE_SHEEN_MASK_MAP');

			this.uniforms['g_vPackedConst6'] = vec4.fromValues(variables.get('$SheenMaskScaleX'), variables.get('$SheenMaskScaleY'), variables.get('$SheenMaskOffsetX'), variables.get('$SheenMaskOffsetY'));
			this.uniforms['g_vPackedConst7'] = vec4.fromValues(variables.get('$SheenMaskDirection'), 0, 0, 0);
		}
		if (parameters['$sheenmap']) {
			this.setTexture('sheenMap', Source1TextureManager.getTexture(this.repository, parameters['$sheenmap'], 0, true), 'USE_SHEEN_MAP');
		}

		if (proxyParams['SheenTintColor']) {
			this.uniforms['g_cCloakColorTint'] = proxyParams['SheenTintColor'];
		} else {
			let sheenmaptint = variables.get('$sheenmaptint');
			if (sheenmaptint) {
				this.uniforms['g_cCloakColorTint'] = sheenmaptint;
			}
		}


		//uniform vec4 g_vPackedConst6;
		//uniform vec4 g_vPackedConst7;


		//TODOv3: only do this if a variable is changed
		this.uniforms['g_DiffuseModulation'] = this.computeModulationColor(this.diffuseModulation);
	}

	clone() {
		return new VertexLitGenericMaterial(/*this.repository, this.fileName, */this.parameters);
	}

	get shaderSource() {
		return 'source1_vertexlitgeneric';
	}
}
SourceEngineVMTLoader.registerMaterial('vertexlitgeneric', VertexLitGenericMaterial);
MaterialManager.registerMaterial('VertexLitGeneric', VertexLitGenericMaterial, SourceEngineMaterialManager);
