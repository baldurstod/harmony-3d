import { vec3, vec4 } from 'gl-matrix';
import { DynamicParams } from '../../../entities/entity';
import { MATERIAL_BLENDING_ADDITIVE, MATERIAL_BLENDING_NONE } from '../../../materials/material';
import { RaytracingMaterial, RtMaterial } from '../../../raytracing/material';
import { Texture } from '../../../textures/texture';
import { Source1VmtLoader } from '../loaders/source1vmtloader';
import { Source1Material, TextureRole } from './source1material';

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
		this.setUniformValue('g_ShaderControls', vec4.fromValues(1, 0, 1, 0));//TODOv3
		this.setUniformValue('g_DiffuseModulation', this.#diffuseModulation);

		const btbba = this.variables.get('$blendtintbybasealpha');
		if (btbba == 1) {
			this.setAlphaTest(false);
			this.variables.set('$alphatest', 0);
			if (this.variables.get('$selfillum') != 1) {
				this.removeDefine('USE_SELF_ILLUM');
				this.setDefine('BLEND_TINT_BY_BASE_ALPHA');
				this.setUniformValue('uBlendTintColorOverBase', this.variables.get('$blendtintcoloroverbase') ?? 0);

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

		this.setUniformValue('g_cCloakColorTint', vec3.create());


		this.variables.set('$SheenMaskScaleX', 1.0);
		this.variables.set('$SheenMaskScaleY', 1.0);
		this.variables.set('$SheenMaskOffsetX', 0.0);
		this.variables.set('$SheenMaskOffsetY', 0.0);
		this.variables.set('$SheenMaskDirection', 0.0);
	}

	override afterProcessProxies(proxyParams: DynamicParams): void {
		const variables = this.variables;
		const parameters = this.vmt;

		const sheenMapMaskFrame = variables.get('$sheenmapmaskframe');//variables.get('$sheenmapmaskframe')
		if (parameters['$sheenmapmask']) {
			this.setTexture('sheenMaskTexture', this.getTexture(TextureRole.SheenMask, this.repository, parameters['$sheenmapmask'], sheenMapMaskFrame), 'USE_SHEEN_MASK_MAP');

			const g_vPackedConst6 = vec4.fromValues(variables.get('$SheenMaskScaleX'), variables.get('$SheenMaskScaleY'), variables.get('$SheenMaskOffsetX'), variables.get('$SheenMaskOffsetY'));
			const g_vPackedConst7 = vec4.fromValues(variables.get('$SheenMaskDirection'), 0, 0, 0);
			this.setUniformValue('g_vPackedConst6', g_vPackedConst6);
			this.setUniformValue('g_vPackedConst7', g_vPackedConst7);
			this.setSubUniformValue('sheenUniforms.g_vPackedConst6', g_vPackedConst6);
			this.setSubUniformValue('sheenUniforms.g_vPackedConst7', g_vPackedConst7);
		}
		if (parameters['$sheenmap']) {
			this.setTexture('sheenTexture', this.getTexture(TextureRole.Sheen, this.repository, parameters['$sheenmap'], 0, true), 'USE_SHEEN_MAP');
		}

		if (proxyParams['SheenTintColor']) {
			this.setUniformValue('g_cCloakColorTint', proxyParams['SheenTintColor']);
			this.setSubUniformValue('sheenUniforms.g_cCloakColorTint', proxyParams['SheenTintColor']);
		} else {
			const sheenmaptint = variables.get('$sheenmaptint');
			if (sheenmaptint) {
				this.setUniformValue('g_cCloakColorTint', sheenmaptint);
				this.setSubUniformValue('sheenUniforms.g_cCloakColorTint', sheenmaptint);
			}
		}


		//uniform vec4 g_vPackedConst6;
		//uniform vec4 g_vPackedConst7;


		//TODOv3: only do this if a variable is changed
		this.setUniformValue('g_DiffuseModulation', this.computeModulationColor(this.#diffuseModulation));
	}

	override clone(): VertexLitGenericMaterial {
		return new VertexLitGenericMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	override getShaderSource(): string {
		return 'source1_vertexlitgeneric';
	}

	override getRaytracingMaterial(index: number): RaytracingMaterial {
		const cubeMapTint = vec4.fromValues(1, 1, 1, 1);
		const uCubeMapTint = this.getUniformValue('uCubeMapTint') as vec3;
		if (uCubeMapTint) {
			cubeMapTint[0] = uCubeMapTint[0];
			cubeMapTint[1] = uCubeMapTint[1];
			cubeMapTint[2] = uCubeMapTint[2];
		}

		return {
			index,
			materialType: RtMaterial.Source1VertexLitGeneric,
			reflectionRatio: 0.1,
			reflectionGloss: 1,
			refractionIndex: 0.1,
			albedo: vec3.fromValues(
				0.901960015296936,
				0.49411699175834656,
				0.1333329975605011,
			),// TODO: set actual value
			textures: new Map([
				[0, this.getUniformValue('colorMap') as Texture],
				[1, this.getUniformValue('normalTexture') as Texture],
				[3, this.getUniformValue('cubeTexture') as Texture],
			]),
			flatShading: false,
			v0: cubeMapTint,
		}
	}
}
Source1VmtLoader.registerMaterial('vertexlitgeneric', VertexLitGenericMaterial);
//MaterialManager.registerMaterial('VertexLitGeneric', VertexLitGenericMaterial, Source1MaterialManager);
