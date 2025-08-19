import { vec3, vec4 } from 'gl-matrix';
import { DynamicParams } from '../../../entities/entity';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';
import { SourceEngineMaterial, SourceEngineMaterialParams, SourceEngineMaterialVmt, TextureRole, readColor } from './sourceenginematerial';

const DEFAULT_WEAR_PROGRESS = 0.0;//0.45;

//TODO: deprecate
export class CustomWeaponMaterial extends SourceEngineMaterial {
	diffuseModulation = vec4.fromValues(1.0, 1.0, 1.0, 1.0);

	constructor(repository: string, path: string, vmt: SourceEngineMaterialVmt, params: SourceEngineMaterialParams = {}) {
		super(repository, path, vmt, params);


		//this.uniforms['phongfresnelranges'] = SourceEngineMaterial.readColor(parameters['$phongfresnelranges']);
		/*float fPixelFogType = pShaderAPI->GetPixelFogCombo() == 1 ? 1 : 0;
		float fWriteDepthToAlpha = bWriteDepthToAlpha && IsPC() ? 1 : 0;
		float fWriteWaterFogToDestAlpha = (pShaderAPI->GetPixelFogCombo() == 1 && bWriteWaterFogToAlpha) ? 1 : 0;
		float fVertexAlpha = bHasVertexAlpha ? 1 : 0;*/
		this.uniforms['g_ShaderControls'] = vec4.fromValues(1, 0, 1, 0);//TODOv3
		this.uniforms['g_PreviewPhongBoosts'] = vec4.fromValues(1, 1, 1, 1);
		this.uniforms['g_DiffuseModulation'] = this.diffuseModulation;

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

	afterProcessProxies(proxyParams: DynamicParams) {
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

		if (parameters['$maskstexture']) {
			this.uniforms['mask1Map'] = this.getTexture(TextureRole.Mask, this.repository, parameters['$maskstexture'], 0);
			this.setDefine('USE_MASK1_MAP');//TODOv3: set this automaticaly
		}

		if (parameters['$pattern']) {
			this.uniforms['patternMap'] = this.getTexture(TextureRole.Pattern, this.repository, parameters['$pattern'], 0);
			this.setDefine('USE_PATTERN_MAP');//TODOv3: set this automaticaly
		}

		if (parameters['$aotexture']) {
			this.uniforms['aoMap'] = this.getTexture(TextureRole.Ao, this.repository, parameters['$aotexture'], 0);
			this.setDefine('USE_AO_MAP');//TODOv3: set this automaticaly
		}

		if (parameters['$weartexture']) {
			this.uniforms['scratchesMap'] = this.getTexture(TextureRole.Scratches, this.repository, parameters['$weartexture'], 0);
			this.setDefine('USE_SCRATCHES_MAP');//TODOv3: set this automaticaly
		}

		if (parameters['$grungetexture']) {
			this.uniforms['grungeMap'] = this.getTexture(TextureRole.Grunge, this.repository, parameters['$grungetexture'], 0);
			this.setDefine('USE_GRUNGE_MAP');//TODOv3: set this automaticaly
		}

		const expTexture = parameters['$exptexture'];
		if (expTexture) {
			this.uniforms['exponentMap'] = this.getTexture(TextureRole.Exponent, this.repository, expTexture, 0);
			this.setDefine('USE_EXPONENT_MAP');//TODOv3: set this automaticaly
		}

		const surfaceTexture = parameters['$surfacetexture'];
		if (surfaceTexture) {
			this.uniforms['surfaceMap'] = this.getTexture(TextureRole.Surface, this.repository, surfaceTexture, 0);
			this.setDefine('USE_SURFACE_MAP');//TODOv3: set this automaticaly
		}

		const posTexture = parameters['$postexture'];
		if (posTexture) {
			this.uniforms['posMap'] = this.getTexture(TextureRole.Pos, this.repository, posTexture, 0);
			this.setDefine('USE_POS_MAP');//TODOv3: set this automaticaly
		}

		/*

					if( bAOTexture )
					{
						pShaderShadow->EnableTexture( SHADER_SAMPLER0, true );		// [sRGB] Ambient Occlusion
					}
					if( bWearTexture )
					{
						pShaderShadow->EnableTexture( SHADER_SAMPLER1, true );		// Scratches
					}
					if( bExpTexture )
					{
						pShaderShadow->EnableTexture( SHADER_SAMPLER2, true );		// Exponent
					}
					if ( bBaseTexture )
					{
						pShaderShadow->EnableTexture( SHADER_SAMPLER3, true );		// [sRGB] Base
					}
					if( bMasksTexture )
					{
						pShaderShadow->EnableTexture( SHADER_SAMPLER4, true );		// Masks
					}
					if( bGrungeTexture )
					{
						pShaderShadow->EnableTexture( SHADER_SAMPLER5, true );		// [sRGB] Grunge
					}
					if( bSurfaceTexture )
					{
						pShaderShadow->EnableTexture( SHADER_SAMPLER6, true );		// Obj-space normal and cavity
					}
					if( bPosTexture )
					{
						pShaderShadow->EnableTexture( SHADER_SAMPLER7, true );		// High-precision Position
					}
					if( bPaintTexture )
					{
						pShaderShadow->EnableTexture( SHADER_SAMPLER8, true );		// Paint
					}	*/


		if (proxyParams['SheenTintColor']) {
			this.uniforms['g_cCloakColorTint'] = proxyParams['SheenTintColor'];
		} else {
			const sheenmaptint = variables.get('$sheenmaptint');
			if (sheenmaptint) {
				this.uniforms['g_cCloakColorTint'] = sheenmaptint;
			}
		}

		const wearProgress = proxyParams['WearProgress'] ?? 0;
		if (wearProgress !== undefined) {
			this.uniforms['uWearProgress'] = wearProgress;
		} else {
			this.uniforms['uWearProgress'] = DEFAULT_WEAR_PROGRESS;
		}


		//uniform vec4 g_vPackedConst6;
		//uniform vec4 g_vPackedConst7;


		//TODOv3: only do this if a variable is changed
		this.uniforms['g_DiffuseModulation'] = this.computeModulationColor(this.diffuseModulation);
	}

	set style(style: string) {
		this.setDefine('PAINT_STYLE', style);
	}

	setColorUniform(uniformName: string, value: string) {
		const color = readColor(value);
		if (color) {
			//vec3.scale(color, color, 1 / 255.0);
			this.uniforms[uniformName] = color;
		}
	}

	set color0(color: string) {
		this.setColorUniform('uCamoColor0', color);
	}

	set color1(color: string) {
		this.setColorUniform('uCamoColor1', color);
	}

	set color2(color: string) {
		this.setColorUniform('uCamoColor2', color);
	}

	set color3(color: string) {
		this.setColorUniform('uCamoColor3', color);
	}
	/*
		setUniformTransform(uniformName, scale, translation, rotation) {
			let transformMatrix = this.getTexCoordTransform(scale, translation, rotation);
			this.uniforms[uniformName] = new Float32Array([
															transformMatrix[0], transformMatrix[4], transformMatrix[8], transformMatrix[12],
															transformMatrix[1], transformMatrix[5], transformMatrix[9], transformMatrix[13]
															]);
		}

		setPatternTexCoordTransform(scale, translation, rotation) {
			this.setUniformTransform('g_patternTexCoordTransform[0]', scale, translation, rotation);
		}

		setWearTexCoordTransform(scale, translation, rotation) {
			this.setUniformTransform('g_wearTexCoordTransform[0]', scale, translation, rotation);
		}

		setGrungeTexCoordTransform(scale, translation, rotation) {
			this.setUniformTransform('g_grungeTexCoordTransform[0]', scale, translation, rotation);
		}
	*/

	setPatternScale(scale:number) {
		(this.uniforms['g_PreviewPhongBoosts'] as vec3)[2] = scale;
	}

	/*

		"name": "aa_vertigo",
		"desc": "#PaintKit_aa_vertigo",
		"rarity": "mythical",
		"pattern": "vertigo",
		"wear_default": "0.150000",
		"style": "6",
		"color0": "102 92 85",
		"color1": "16 16 16",
		"color2": "16 16 16",
		"color3": "16 16 16",
		"pattern_scale": "1.400000",
		"pattern_offset_x_start": "0.040000",
		"pattern_offset_x_end": "0.140000",
		"pattern_offset_y_start": "-0.440000",
		"pattern_offset_y_end": "-0.180000",
		"pattern_rotate_start": "7",
		"pattern_rotate_end": "25",
		"wear_remap_min": "0.000000",
		"wear_remap_max": "0.080000",
		"phongexponent": "32",
		"phongalbedoboost": "80"
		*/

	clone() {
		return new CustomWeaponMaterial(this.repository, this.path, this.vmt, this.parameters);
	}


	get shaderSource() {
		return 'source1_customweapon';
	}
}
SourceEngineVMTLoader.registerMaterial('customweapon', CustomWeaponMaterial);
