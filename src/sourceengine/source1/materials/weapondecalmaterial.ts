import { mat4, vec2, vec3, vec4 } from 'gl-matrix';

import { SourceEngineMaterial, readColor } from './sourceenginematerial';
import { SHADER_PARAM_TYPE_INTEGER, SHADER_PARAM_TYPE_COLOR, SHADER_PARAM_TYPE_STRING, SHADER_PARAM_TYPE_FLOAT } from './sourceenginematerial';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';
import { Source1TextureManager } from '../textures/source1texturemanager';

import { lerp } from '../../../math/functions';

const DEFAULT_WEAR_PROGRESS = 0.0;//0.45;

const DEFAULT_BASE_TEXTURE = 'models/weapons/customization/stickers/default/sticker_default';
const DEFAULT_AO_TEXTURE = 'models/weapons/customization/stickers/default/ao_default';
const DEFAULT_GRUNGE_TEXTURE = 'models/weapons/customization/shared/sticker_paper';
const DEFAULT_WEAR_TEXTURE = 'models/weapons/customization/shared/paint_wear';
//TODO: deprecate
export class WeaponDecalMaterial extends SourceEngineMaterial {
	constructor(params: any = {}) {
		super(params);
		this.setValues(params);
		let variables = this.variables;

		this.setDefine('MIRROR', variables.get('$mirrorhorizontal') ?? 0);
		this.setDefine('DESATBASETINT', variables.get('$desatbasetint') ? '1' : '0');

		this.uniforms['uTintLerpBase'] = variables.get('$desatbasetint');

		this.polygonOffset = true;
		this.polygonOffsetFactor = -5;
		this.polygonOffsetUnits = -5;
		this.setPatternTexCoordTransform(vec2.fromValues(1, 1), vec2.create(), 0);

	}

	afterProcessProxies(proxyParams) {
		let variables = this.variables;
		let parameters = this.parameters;
		this.setDefine('DECALSTYLE', variables.get('$decalstyle') ?? 0);//TODO: set this on variable change

		let baseTexture = variables.get('$basetexture');
		if (baseTexture) {
			this.uniforms['colorMap'] = Source1TextureManager.getTexture(this.repository, baseTexture, 0);
			this.setDefine('USE_COLOR_MAP');//TODOv3: set this automaticaly
		}
		const sheenMapMaskFrame = variables.get('$sheenmapmaskframe');//variables.get('$sheenmapmaskframe')
		if (parameters['$sheenmapmask']) {
			this.uniforms['sheenMaskMap'] = Source1TextureManager.getTexture(this.repository, parameters['$sheenmapmask'], sheenMapMaskFrame);
			this.setDefine('USE_SHEEN_MASK_MAP');//TODOv3: set this automaticaly

			this.uniforms['g_vPackedConst6'] = vec4.fromValues(variables.get('$SheenMaskScaleX'), variables.get('$SheenMaskScaleY'), variables.get('$SheenMaskOffsetX'), variables.get('$SheenMaskOffsetY'));
			this.uniforms['g_vPackedConst7'] = vec4.fromValues(variables.get('$SheenMaskDirection'), 0, 0, 0);
		}
		if (parameters['$sheenmap']) {
			this.uniforms['sheenMap'] = Source1TextureManager.getTexture(this.repository, parameters['$sheenmap'], 0, true);
			this.setDefine('USE_SHEEN_MAP');//TODOv3: set this automaticaly
		}

		if (parameters['$maskstexture']) {
			this.uniforms['mask1Map'] = Source1TextureManager.getTexture(this.repository, parameters['$maskstexture'], 0);
			this.setDefine('USE_MASK1_MAP');//TODOv3: set this automaticaly
		}

		if (parameters['$pattern']) {
			this.uniforms['patternMap'] = Source1TextureManager.getTexture(this.repository, parameters['$pattern'], 0);
			this.setDefine('USE_PATTERN_MAP');//TODOv3: set this automaticaly
		}

		let aoTexture = variables.get('$aotexture');
		if (aoTexture) {
			this.uniforms['aoMap'] = Source1TextureManager.getTexture(this.repository, aoTexture, 0);
			this.setDefine('USE_AO_MAP');//TODOv3: set this automaticaly
		}

		let wearTexture = variables.get('$weartexture');
		if (wearTexture) {
			this.uniforms['scratchesMap'] = Source1TextureManager.getTexture(this.repository, wearTexture, 0);
			this.setDefine('USE_SCRATCHES_MAP');//TODOv3: set this automaticaly
		}

		let grungeTexture = variables.get('$grungetexture');
		if (grungeTexture) {
			this.uniforms['grungeMap'] = Source1TextureManager.getTexture(this.repository, grungeTexture, 0);
			this.setDefine('USE_GRUNGE_MAP');//TODOv3: set this automaticaly
		}

		let expTexture = parameters['$exptexture'];
		if (expTexture) {
			this.uniforms['exponentMap'] = Source1TextureManager.getTexture(this.repository, expTexture, 0);
			this.setDefine('USE_EXPONENT_MAP');//TODOv3: set this automaticaly
		}

		let holoMaskTexture = variables.get('$holomask');
		if (holoMaskTexture) {
			this.uniforms['holoMaskMap'] = Source1TextureManager.getTexture(this.repository, holoMaskTexture, 0);
			this.setDefine('USE_HOLO_MASK_MAP');//TODOv3: set this automaticaly
		}

		let holoSpectrumTexture = variables.get('$holospectrum');
		if (holoSpectrumTexture) {
			this.uniforms['holoSpectrumMap'] = Source1TextureManager.getTexture(this.repository, holoSpectrumTexture, 0);
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

		let wearProgress = proxyParams['WearProgress'] ?? 0.0;//TODO
		let wearRemapMid = variables.get('$wearremapmid');
		let flX = wearProgress;
		let flP = variables.get('$wearremapmid');
		let flRemappedWear = 2.0 * (1.0 - flX) * flX * flP + (flX * flX);

		//remap wear to custom min/max bounds
		flRemappedWear *= (variables.get('$wearremapmax') - variables.get('$wearremapmin'));
		flRemappedWear += variables.get('$wearremapmin');

		//we already shipped wear progress levels, this is an additional param that individual stickers
		//can drive to bias their wear AGAIN as they move away from 0
		flRemappedWear += flX * flX * variables.get('$wearbias');

		//lerp wear width along wear progress
		//float flLerpedWearWidth = Lerp( variables[info.m_nWearProgress]->GetFloatValue(), variables[info.m_nWearWidthMin]->GetFloatValue(), variables[info.m_nWearWidthMax]->GetFloatValue() );
		let flLerpedWearWidth = lerp(variables.get('$wearwidthmin'), variables.get('$wearwidthmax'), wearProgress);


		this.uniforms['uWearParams'] = vec4.fromValues(wearProgress, flLerpedWearWidth, flRemappedWear, variables.get('$unwearstrength'));
	}

	set style(style) {
		this.setDefine('PAINT_STYLE', style);
	}

	setColorUniform(uniformName, value) {
		let color = readColor(value);
		if (color) {
			//vec3.scale(color, color, 1 / 255.0);
			this.uniforms[uniformName] = color;
		}
	}

	set color0(color) {
		this.setColorUniform('uCamoColor0', color);
	}

	set color1(color) {
		this.setColorUniform('uCamoColor1', color);
	}

	set color2(color) {
		this.setColorUniform('uCamoColor2', color);
	}

	set color3(color) {
		this.setColorUniform('uCamoColor3', color);
	}

	setPatternTexCoordTransform(scale, translation, rotation) {
		let transformMatrix = this.getTexCoordTransform(scale, translation, rotation);
		this.uniforms['g_patternTexCoordTransform[0]'] = new Float32Array([
			transformMatrix[0], transformMatrix[4], transformMatrix[8], transformMatrix[12],
			transformMatrix[1], transformMatrix[5], transformMatrix[9], transformMatrix[13]
		]);
	}

	getTexCoordTransform(scale, translation, rotation) {
		let transformMatrix = mat4.create();
		let tempMatrix = mat4.create();
		let tempVec3 = vec3.create();

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

		let offset = vec2.fromValues(0.5 / scale[0], 0.5 / scale[1]);
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
		return new WeaponDecalMaterial(this.parameters);
	}

	get shaderSource() {
		return 'source1_weapondecal';
	}
}
SourceEngineVMTLoader.registerMaterial('weapondecal', WeaponDecalMaterial);


const WEAPON_DECAL_DEFAULT_PARAMETERS = {
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
