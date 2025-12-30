import { mat4, vec2, vec3, vec4 } from 'gl-matrix';
import { Source1VmtLoader } from '../loaders/source1vmtloader';
import { SHADER_PARAM_TYPE_COLOR, SHADER_PARAM_TYPE_FLOAT, SHADER_PARAM_TYPE_INTEGER, SHADER_PARAM_TYPE_STRING, Source1Material, TextureRole, VmtParameters, readColor } from './source1material';

import { DynamicParams } from '../../../entities/entity';
import { lerp } from '../../../math/functions';

const DEFAULT_WEAR_PROGRESS = 0.0;//0.45;

const DEFAULT_BASE_TEXTURE = 'models/weapons/customization/stickers/default/sticker_default';
const DEFAULT_AO_TEXTURE = 'models/weapons/customization/stickers/default/ao_default';
const DEFAULT_GRUNGE_TEXTURE = 'models/weapons/customization/shared/sticker_paper';
const DEFAULT_WEAR_TEXTURE = 'models/weapons/customization/shared/paint_wear';

//TODO: deprecate
export class WeaponDecalMaterial extends Source1Material {
	#initialized = false;

	init(): void {
		if (this.#initialized) {
			return;
		}
		this.#initialized = true;
		super.init();
		const variables = this.variables;

		this.setDefine('MIRROR', variables.get('$mirrorhorizontal') ?? 0);
		this.setDefine('DESATBASETINT', variables.get('$desatbasetint') ? '1' : '0');

		this.uniforms['uTintLerpBase'] = variables.get('$desatbasetint');

		this.polygonOffset = true;
		this.polygonOffsetFactor = -5;
		this.polygonOffsetUnits = -5;
		this.setPatternTexCoordTransform(vec2.fromValues(1, 1), vec2.create(), 0);

	}

	afterProcessProxies(proxyParams: DynamicParams) {
		const variables = this.variables;
		const parameters = this.vmt;
		this.setDefine('DECALSTYLE', variables.get('$decalstyle') ?? 0);//TODO: set this on variable change

		const baseTexture = variables.get('$basetexture');
		if (baseTexture) {
			this.uniforms['colorMap'] = this.getTexture(TextureRole.Color, this.repository, baseTexture, 0);
			this.setDefine('USE_COLOR_MAP');//TODOv3: set this automaticaly
		}
		const sheenMapMaskFrame = variables.get('$sheenmapmaskframe');//variables.get('$sheenmapmaskframe')
		if (parameters['$sheenmapmask']) {
			this.uniforms['sheenMaskTexture'] = this.getTexture(TextureRole.SheenMask, this.repository, parameters['$sheenmapmask'], sheenMapMaskFrame);
			this.setDefine('USE_SHEEN_MASK_MAP');//TODOv3: set this automaticaly

			this.uniforms['g_vPackedConst6'] = vec4.fromValues(variables.get('$SheenMaskScaleX'), variables.get('$SheenMaskScaleY'), variables.get('$SheenMaskOffsetX'), variables.get('$SheenMaskOffsetY'));
			this.uniforms['g_vPackedConst7'] = vec4.fromValues(variables.get('$SheenMaskDirection'), 0, 0, 0);
		}
		if (parameters['$sheenmap']) {
			this.uniforms['sheenTexture'] = this.getTexture(TextureRole.Sheen, this.repository, parameters['$sheenmap'], 0, true);
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

		const aoTexture = variables.get('$aotexture');
		if (aoTexture) {
			this.uniforms['aoMap'] = this.getTexture(TextureRole.Ao, this.repository, aoTexture, 0);
			this.setDefine('USE_AO_MAP');//TODOv3: set this automaticaly
		}

		const wearTexture = variables.get('$weartexture');
		if (wearTexture) {
			this.uniforms['scratchesMap'] = this.getTexture(TextureRole.Scratches, this.repository, wearTexture, 0);
			this.setDefine('USE_SCRATCHES_MAP');//TODOv3: set this automaticaly
		}

		const grungeTexture = variables.get('$grungetexture');
		if (grungeTexture) {
			this.uniforms['grungeMap'] = this.getTexture(TextureRole.Grunge, this.repository, grungeTexture, 0);
			this.setDefine('USE_GRUNGE_MAP');//TODOv3: set this automaticaly
		}

		const expTexture = parameters['$exptexture'];
		if (expTexture) {
			this.uniforms['exponentMap'] = this.getTexture(TextureRole.Exponent, this.repository, expTexture, 0);
			this.setDefine('USE_EXPONENT_MAP');//TODOv3: set this automaticaly
		}

		const holoMaskTexture = variables.get('$holomask');
		if (holoMaskTexture) {
			this.uniforms['holoMaskMap'] = this.getTexture(TextureRole.Holo, this.repository, holoMaskTexture, 0);
			this.setDefine('USE_HOLO_MASK_MAP');//TODOv3: set this automaticaly
		}

		const holoSpectrumTexture = variables.get('$holospectrum');
		if (holoSpectrumTexture) {
			this.uniforms['holoSpectrumMap'] = this.getTexture(TextureRole.HoloSpectrum, this.repository, holoSpectrumTexture, 0);
			this.setDefine('USE_HOLO_SPECTRUM_MAP');//TODOv3: set this automaticaly
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


		this.uniforms['uColorTint'] = variables.get('$colortint');
		this.uniforms['uColorTin2'] = variables.get('$colortint2');
		this.uniforms['uColorTint3'] = variables.get('$colortin3');
		this.uniforms['uColorTint4'] = variables.get('$colortint4');
		// Todo: optimize
		this.uniforms['uPhongParams'] = vec4.fromValues(4.0, 1.0, 1.0, 2.0);//TODO: set actual values
		this.uniforms['uPhongFresnel'] = vec4.fromValues(1.0, 1.0, 1.0, 0.0);//TODO: set actual values

		const wearProgress = proxyParams['WearProgress'] ?? 0.0;//TODO
		const wearRemapMid = variables.get('$wearremapmid');
		const flX = wearProgress;
		const flP = variables.get('$wearremapmid');
		let flRemappedWear = 2.0 * (1.0 - flX) * flX * flP + (flX * flX);

		//remap wear to custom min/max bounds
		flRemappedWear *= (variables.get('$wearremapmax') - variables.get('$wearremapmin'));
		flRemappedWear += variables.get('$wearremapmin');

		//we already shipped wear progress levels, this is an additional param that individual stickers
		//can drive to bias their wear AGAIN as they move away from 0
		flRemappedWear += flX * flX * variables.get('$wearbias');

		//lerp wear width along wear progress
		//float flLerpedWearWidth = Lerp( variables[info.m_nWearProgress]->GetFloatValue(), variables[info.m_nWearWidthMin]->GetFloatValue(), variables[info.m_nWearWidthMax]->GetFloatValue() );
		const flLerpedWearWidth = lerp(variables.get('$wearwidthmin'), variables.get('$wearwidthmax'), wearProgress);


		this.uniforms['uWearParams'] = vec4.fromValues(wearProgress, flLerpedWearWidth, flRemappedWear, variables.get('$unwearstrength'));
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

	setPatternTexCoordTransform(scale: vec2, translation: vec2, rotation: number) {
		const transformMatrix = this.#getTexCoordTransform(scale, translation, rotation);
		this.uniforms['g_patternTexCoordTransform[0]'] = new Float32Array([
			transformMatrix[0], transformMatrix[4], transformMatrix[8], transformMatrix[12],
			transformMatrix[1], transformMatrix[5], transformMatrix[9], transformMatrix[13]
		]);
	}

	#getTexCoordTransform(scale: vec2, translation: vec2, rotation: number) {
		const transformMatrix = mat4.create();
		const tempMatrix = mat4.create();
		const tempVec3 = vec3.create();

		tempVec3[0] = translation[0] - 0.5;
		tempVec3[1] = translation[1] - 0.5;
		tempVec3[2] = 0.0;
		mat4.fromTranslation(transformMatrix, tempVec3);

		tempVec3[0] = scale[0];
		tempVec3[1] = scale[1];
		tempVec3[2] = 1.0;
		mat4.fromScaling(tempMatrix, tempVec3);
		mat4.multiply(transformMatrix, transformMatrix, tempMatrix);

		mat4.fromZRotation(tempMatrix, rotation);
		mat4.multiply(transformMatrix, transformMatrix, tempMatrix);

		const offset = vec2.fromValues(0.5 / scale[0], 0.5 / scale[1]);
		vec2.rotate(offset, offset, vec2.create(), -rotation);

		tempVec3[0] = offset[0];
		tempVec3[1] = offset[1];
		tempVec3[2] = 0.0;
		mat4.fromTranslation(tempMatrix, tempVec3);
		mat4.multiply(transformMatrix, transformMatrix, tempMatrix);
		return transformMatrix;
	}

	getDefaultParameters() {
		return WEAPON_DECAL_DEFAULT_PARAMETERS;
	}

	clone() {
		return new WeaponDecalMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	get shaderSource() {
		return 'source1_weapondecal';
	}
}
Source1VmtLoader.registerMaterial('weapondecal', WeaponDecalMaterial);


const WEAPON_DECAL_DEFAULT_PARAMETERS: VmtParameters = {
	//$basetexture : [SHADER_PARAM_TYPE_STRING, 'models/weapons/customization/stickers/default/sticker_default'],
	//$aotexture : [SHADER_PARAM_TYPE_STRING, 'models/weapons/customization/stickers/default/ao_default'],
	$grungetexture: [SHADER_PARAM_TYPE_STRING, 'models/weapons/customization/shared/sticker_paper'],
	$weartexture: [SHADER_PARAM_TYPE_STRING, 'models/weapons/customization/shared/paint_wear'],
	$decalstyle: [SHADER_PARAM_TYPE_INTEGER, 0],
	$colortint: [SHADER_PARAM_TYPE_COLOR, [255, 255, 255]],
	$colortint2: [SHADER_PARAM_TYPE_COLOR, [0, 0, 0]],
	$colortint3: [SHADER_PARAM_TYPE_COLOR, [0, 0, 0]],
	$colortint4: [SHADER_PARAM_TYPE_COLOR, [0, 0, 0]],
	$unwearstrength: [SHADER_PARAM_TYPE_FLOAT, 0.2],

	$wearremapmin: [SHADER_PARAM_TYPE_FLOAT, 0.8],
	$wearremapmid: [SHADER_PARAM_TYPE_FLOAT, 0.75],
	$wearremapmax: [SHADER_PARAM_TYPE_FLOAT, 1.],

	$wearwidthmin: [SHADER_PARAM_TYPE_FLOAT, 0.06],
	$wearwidthmax: [SHADER_PARAM_TYPE_FLOAT, 0.12],

	$wearbias: [SHADER_PARAM_TYPE_FLOAT, 0.0],
	$desatbasetint: [SHADER_PARAM_TYPE_FLOAT, 0.0],
}
