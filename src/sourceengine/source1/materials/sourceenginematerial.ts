import { mat4, vec2, vec3, vec4 } from 'gl-matrix';

import { Material, MATERIAL_BLENDING_ADDITIVE, MATERIAL_BLENDING_NORMAL } from '../../../materials/material';
import { TextureManager } from '../../../textures/texturemanager';
import { Source1TextureManager } from '../textures/source1texturemanager';
import { SEQUENCE_SAMPLE_COUNT } from '../loaders/sheet';
import { GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA } from '../../../webgl/constants';
import { ProxyManager } from './proxies/proxymanager';
import { DEBUG, TESTING, WARN } from '../../../buildoptions';
import { DEG_TO_RAD } from '../../../math/constants';
import { clamp } from '../../../math/functions';
import { MatrixBuildScale, MatrixBuildTranslation } from './proxies/texturetransform';
import { Proxy } from './proxies/proxy';
import { RenderFace } from '../../../materials/constants';
import { Texture } from '../../../textures/texture';

const IDENTITY_MAT4 = mat4.create();

function GetTextureTransform(str, mat = mat4.create()) {
	const center = vec2.fromValues(0.5, 0.5);
	//const mat = mat4.create();
	const temp = mat4.create();

	const centerResult = /center *(\d*(?:\.\d)?) *(\d*(?:\.\d)?)/.exec(str);
	const scaleResult = /scale *(\d*(?:\.\d)?) *(\d*(?:\.\d)?)/.exec(str);
	const rotateResult = /rotate *(\d*(?:\.\d)?)/.exec(str);
	const translateResult = /translate *(\d*(?:\.\d)?) *(\d*(?:\.\d)?)/.exec(str);

	if (centerResult) {
		vec2.set(center, Number(centerResult[1]), Number(centerResult[2]));
		MatrixBuildTranslation(mat, -center[0], -center[1], 0.0);
	}

	if (scaleResult) {
		MatrixBuildScale(temp, scaleResult[1], scaleResult[2], 1.0);
		mat4.mul(mat, temp, mat);
	}

	if (rotateResult) {
		mat4.identity(temp);
		mat4.rotateZ(temp, temp, DEG_TO_RAD * Number(rotateResult[1]));
		mat4.mul(mat, temp, mat);
	}
	MatrixBuildTranslation(temp, center[0], center[1], 0.0);
	mat4.mul(mat, temp, mat);

	if (translateResult) {
		MatrixBuildTranslation(temp, translateResult[1], translateResult[2], 0.0);
		mat4.mul(mat, temp, mat);
	}
	return mat;
}

export const SHADER_PARAM_TYPE_TEXTURE = 0;
export const SHADER_PARAM_TYPE_INTEGER = 1;
export const SHADER_PARAM_TYPE_COLOR = 2;
export const SHADER_PARAM_TYPE_VEC2 = 3;
export const SHADER_PARAM_TYPE_VEC3 = 4;
export const SHADER_PARAM_TYPE_VEC4 = 5;
export const SHADER_PARAM_TYPE_ENVMAP = 6;// obsolete
export const SHADER_PARAM_TYPE_FLOAT = 7;
export const SHADER_PARAM_TYPE_BOOL = 8;
export const SHADER_PARAM_TYPE_FOURCC = 9;
export const SHADER_PARAM_TYPE_MATRIX = 10;
export const SHADER_PARAM_TYPE_MATERIAL = 11;
export const SHADER_PARAM_TYPE_STRING = 12;
export const SHADER_PARAM_TYPE_MATRIX4X2 = 13;

const VMT_PARAMETERS = {
	$alpha: [SHADER_PARAM_TYPE_FLOAT, 1.0],
	$color: [SHADER_PARAM_TYPE_COLOR, [1, 1, 1]],
	$color2: [SHADER_PARAM_TYPE_COLOR, [1, 1, 1]],
	$envmaptint: [SHADER_PARAM_TYPE_COLOR, [1, 1, 1]],
	$phong: [SHADER_PARAM_TYPE_BOOL, 0],
	$phongalbedotint: [SHADER_PARAM_TYPE_BOOL, false],
	$phongexponent: [SHADER_PARAM_TYPE_FLOAT, 5.0],
	$phongexponentfactor: [SHADER_PARAM_TYPE_FLOAT, 0.0],
	$phongexponenttexture: [SHADER_PARAM_TYPE_STRING, ''],
	$phongboost: [SHADER_PARAM_TYPE_FLOAT, 1.0],
	$lightwarptexture: [SHADER_PARAM_TYPE_STRING, ''],
	$selfillumtint: [SHADER_PARAM_TYPE_COLOR, [1, 1, 1]],
	$detailscale: [SHADER_PARAM_TYPE_VEC2, [1, 1]],
	$detailblendmode: [SHADER_PARAM_TYPE_INTEGER, 0],
	$no_draw: [SHADER_PARAM_TYPE_BOOL, false],
}

function initDefaultParameters(defaultParameters, parameters, variables) {
	if (defaultParameters) {
		for (const parameterName in defaultParameters) {
			if (parameters[parameterName] === undefined) {
				const defaultParam = defaultParameters[parameterName];
				//variables.set(parameterName, defaultParam[1]);
				switch (defaultParam[0]) {
					case SHADER_PARAM_TYPE_COLOR:
						variables.set(parameterName, vec3.clone(defaultParam[1]));
						break;
					default:
						variables.set(parameterName, defaultParam[1]);
						break;
				}
			}
		}
	}
}

let defaultTexture: Texture;
function getDefaultTexture(): Texture {
	if (!defaultTexture) {
		defaultTexture = TextureManager.createFlatTexture([255, 255, 255]);
		defaultTexture.addUser(SourceEngineMaterial);
	}
	return defaultTexture;
}

export class SourceEngineMaterial extends Material {
	#detailTextureTransform = mat4.create();
	//static #defaultTexture;
	repository: string;
	fileName: string;
	proxyParams: any;
	proxies: Proxy[];
	variables: Map<string, any>;
	numFrames: number;
	frameX: number;
	frameY: number;
	sequenceLength: number;

	constructor(params: any = {}/*repository, fileName, parameters = Object.create(null)*/) {
		super(params);
		this.repository = params.repository;
		this.fileName = params.filename;
		this.proxyParams = {};
		if (DEBUG) {
			//this.proxyParams.StatTrakNumber = 192837;//TODOv3 removeme
			//this.proxyParams.WeaponLabelText = 'AVCDEFGHIJKLMONPQRSTU';//TODOv3 removeme
			//this.proxyParams.ItemTintColor = vec3.fromValues(Math.random(), Math.random(), Math.random());
			//this.proxyParams.ItemTintColor = vec3.fromValues(1.0, 105 / 255, 180 / 255);
		}

		this.proxies = [];
		this.variables = new Map();

		this.#initUniforms();

		const variables = this.variables;
		initDefaultParameters(VMT_PARAMETERS, params, variables);
		initDefaultParameters(this.getDefaultParameters(), params, variables);

		const readParameters = (parameters) => {
			for (const parameterName in parameters) {
				const value = parameters[parameterName];

				const sanitized = this.sanitizeValue(parameterName, value);
				if (sanitized) {
					this.variables.set(parameterName, sanitized);
				} else if ((typeof value) == 'string') {
					//try a single number
					const n = Number(value);
					if (!Number.isNaN(n)) {
						this.variables.set(parameterName, n);
					} else {
						const color = readColor(value);
						if (color) {
							this.variables.set(parameterName, color);
						} else {
							const v2 = readVec2(value);
							if (v2) {
								this.variables.set(parameterName, v2);
							} else {
								if (isNaN(Number(value))) {
									this.variables.set(parameterName, value);
								} else {
									this.variables.set(parameterName, Number(value));
								}
							}
						}
					}
				} else {
					this.variables.set(parameterName, value);
				}
			}
		}
		readParameters(params);
		if (params['>=dx90']) {
			readParameters(params['>=dx90']);
		}

		const baseTexture = variables.get('$basetexture');
		if (baseTexture) {
			this.setColorMap(Source1TextureManager.getTexture(this.repository, baseTexture, params['$frame'] || 0, false, params.useSrgb ?? true));
		} else {
			this.setColorMap(getDefaultTexture());
		}

		if (params['$bumpmap']) {
			this.setNormalMap(Source1TextureManager.getTexture(this.repository, params['$bumpmap'], 0, false, false));
		} else {
			this.setNormalMap(null);
		}

		let translucent = false;
		if (params['$alpha']) {
			this.setTransparency(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
			this.setDefine('IS_TRANSLUCENT');
			//TODOv3: adjust opacity accordinly
			if (TESTING) {
				console.assert(false, '$alpha');
			}
			translucent = true;
		}
		if (params['$vertexalpha'] == 1) {
			this.setTransparency(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
			this.setDefine('IS_TRANSLUCENT');
			translucent = true;
			//TODOv3 activate proper define in shader
			//also add vertexcolor
		}
		if (params['$translucent'] == 1) {
			this.setBlending(MATERIAL_BLENDING_NORMAL);
			this.setDefine('IS_TRANSLUCENT');
			translucent = true;
		}
		if (params['$additive'] == 1) {
			if (translucent) {
				this.setBlending(MATERIAL_BLENDING_ADDITIVE);
			} else {
				this.setBlending(MATERIAL_BLENDING_ADDITIVE, true);
			}
			this.setDefine('IS_ADDITIVE');
		}
		if (params['$alphatest'] == 1) {
			this.alphaTest = true;
			this.alphaTestReference = Number.parseFloat(params['$alphatestreference'] ?? 0.5);
		}
		if (params['$vertexalpha'] == 1) {
			this.setDefine('VERTEX_ALPHA');
		}
		if (params['$vertexcolor'] == 1) {
			this.setDefine('VERTEX_COLOR');
		}

		const envmaptint = variables.get('$envmaptint');
		if (envmaptint) {
			this.uniforms['uCubeMapTint'] = envmaptint;
		} else {
			this.uniforms['uCubeMapTint'] = vec3.fromValues(1.0, 1.0, 1.0);
		}

		if (variables.get('$normalmapalphaenvmapmask') == 1) {
			this.setDefine('USE_NORMAL_ALPHA_AS_ENVMAP_MASK');
		}

		if (variables.get('$no_draw')) {
			this.setDefine('NO_DRAW');
		}

		this.uniforms['uTextureTransform'] = IDENTITY_MAT4;
		if (params['$basetexturetransform']) {
			const textureTransform = GetTextureTransform(params['$basetexturetransform']);
			if (textureTransform) {
				this.variables.set('$basetexturetransform', textureTransform);
				this.uniforms['uTextureTransform'] = textureTransform;
			}
		}

		if (params['$nocull'] == 1) {
			this.renderFace(RenderFace.Both);
		}

		const lightWarpTexture = params['$lightwarptexture'];
		this.setTexture('lightWarpMap', lightWarpTexture ? Source1TextureManager.getTexture(this.repository, lightWarpTexture, 0) : null, 'USE_LIGHT_WARP_MAP');

		if (params['$phong'] == 1) {
			this.setDefine('USE_PHONG_SHADING');

			// The $phongexponenttexture is overrided by $phongexponent
			const phongExponentTexture = params['$phongexponenttexture'];
			this.setTexture('phongExponentMap', phongExponentTexture ? Source1TextureManager.getTexture(this.repository, phongExponentTexture, 0) : null, 'USE_PHONG_EXPONENT_MAP');
			if (phongExponentTexture) {
				this.uniforms['uPhongExponentFactor'] = variables.get('$phongexponentfactor');
			}

			this.uniforms['uPhongExponent'] = variables.get('$phongexponent');
			this.uniforms['uPhongBoost'] = variables.get('$phongboost');

			if (params['$basemapalphaphongmask'] == 1) {
				this.setDefine('USE_COLOR_ALPHA_AS_PHONG_MASK');
			}
			if (params['$phongalbedotint'] == 1) {
				this.setDefine('USE_PHONG_ALBEDO_TINT');
			}

			/*VertexLitGeneric
			{
				$phong 1

				$bumpmap				[texture]
				$phongexponent			5			// either/or
				$phongexponenttexture	[texture]	// either/or
				$phongboost				1.0
				$phongfresnelranges		"[0 0.5 1]"
				basemapalphaphongmask
			}*/


		}
		if (variables.get('$selfillum') == 1) {
			this.setDefine('USE_SELF_ILLUM');

			if (variables.get('$selfillum_envmapmask_alpha') == 1) {
				this.setDefine('USE_SELF_ILLUM_ENVMAPMASK_ALPHA');
			}

			const selfIllumTint = variables.get('$selfillumtint');
			if (selfIllumTint) {
				this.uniforms['uSelfIllumTint'] = selfIllumTint;
			} else {
				this.uniforms['uSelfIllumTint'] = vec3.fromValues(1.0, 1.0, 1.0);
			}

			const selfIllumMask = variables.get('$selfillummask');
			this.setTexture('uSelfIllumMaskMap', selfIllumMask ? Source1TextureManager.getTexture(this.repository, selfIllumMask, 0) : null, 'USE_SELF_ILLUM_MASK_MAP');


			if (variables.get('$selfillumfresnel') == 1) {
				this.setDefine('USE_SELF_ILLUM_FRESNEL');

				const selfIllumFresnelMinMaxExp = variables.get('$selfillumfresnelminmaxexp') ?? vec3.fromValues(0.0, 1.0, 1.0);

				const constScaleBiasExp = vec4.fromValues(1.0, 0.0, 1.0, 0.0);
				const flMin = selfIllumFresnelMinMaxExp[0];
				const flMax = selfIllumFresnelMinMaxExp[1];
				const flExp = selfIllumFresnelMinMaxExp[2];

				constScaleBiasExp[1] = (flMax != 0.0) ? (flMin / flMax) : 0.0; // Bias
				constScaleBiasExp[0] = 1.0 - constScaleBiasExp[1]; // Scale
				constScaleBiasExp[2] = flExp; // Exp
				constScaleBiasExp[3] = flMax; // Brightness

				this.uniforms['uSelfIllumScaleBiasExpBrightness'] = constScaleBiasExp;
			}


			/*
						$selfillum
						selfIllumFresnelMinMaxExp
						selfillumtint
						selfIllumFresnel
						selfillummask
						selfillum_envmapmask_alpha
						selfillumtexture
						selfillummaskscale
						*/
		}

		const ssbump = this.variables.get('$ssbump');
		if (ssbump == 1) {
			this.setDefine('USE_SSBUMP');
		} else {
			this.removeDefine('USE_SSBUMP');
		}


		const proxies = params['proxies'];
		if (proxies) {
			this.initProxies(proxies);
		}
		//this.blend = true;
		//this.blendFuncSource = GL_SRC_ALPHA;
		//this.blendFuncDestination = GL_ONE_MINUS_SRC_ALPHA;
		//this.blendFuncDestination = GL_ONE;
		//TODO: $ignorez
	}

	#initUniforms() {
		this.uniforms['uDetailTextureTransform'] = this.#detailTextureTransform;
	}

	setNumFrames(frames, frameX, frameY, sequenceLength) {
		this.numFrames = frames;
		this.frameX = frameX;
		this.frameY = frameY;
		this.sequenceLength = sequenceLength;
	}

	getTexCoords(flCreationTime, flCurTime, flAgeScale, nSequence) {
		const texture = this.uniforms['colorMap'] as Texture;
		if (!texture) {
			return;
		}

		const vtf = texture.properties.get('vtf');
		const sheet = vtf?.sheet;

		if (sheet) {
			//SETextureControler.getAnimSheet('materials/' + this.baseTexture);
			if (sheet) {
				let group = sheet.sequences[nSequence]
				if (!group) { // In case sequence # is outside VTF range
					group = sheet.sequences[0];
				}

				if (group) {
					if (group.frameCount == 1) {
						return group.m_pSamples[0];
					}

					let flAge = flCurTime - flCreationTime;
					flAge *= flAgeScale;
					let nFrame = Math.abs(Math.round(flAge));

					if (group.clamp) {
						nFrame = Math.min(nFrame, SEQUENCE_SAMPLE_COUNT - 1);
					} else {
						nFrame &= SEQUENCE_SAMPLE_COUNT - 1;
					}
					return group.m_pSamples[nFrame];
				}
			}
		}
		return null;
	}

	getFrameSpan(sequence) {
		const texture = this.uniforms['colorMap'] as Texture;
		if (!texture) {
			return;
		}

		const vtf = texture.properties.get('vtf');
		const sheet = vtf?.sheet;

		if (sheet) {
			//const sheet = texture.vtf.sheet;//SETextureControler.getAnimSheet('materials/' + this.baseTexture);
			if (sheet) {
				let group = sheet.sequences[sequence];
				if (!group) {
					group = sheet.sequences[0];
				}

				if (group) {
					return group.duration;
				}
			}
		}
		return null;
	}

	/**
	 * Init proxies
	 * @param proxies {Array} List of proxies
	 */
	initProxies(proxies) {
		if (!proxies) { return; }

		for (const proxyIndex in proxies) {
			if (proxies.hasOwnProperty(proxyIndex)) {
				const proxyName = proxyIndex.replace(/#\d+$/, '');
				const proxy = ProxyManager.getProxy(proxyName);
				if (proxy) {
					proxy.setParams(proxies[proxyIndex], this.variables);
					this.proxies.push(proxy);
				} else {
					if (WARN) {
						console.warn('Unknown proxy %s in %s', proxyName, this.fileName);
					}
				}
			}
		}
	}

	updateMaterial(time, mesh) {
		this.processProxies(time, mesh.materialsParams);
	}

	/**
	 * Process proxies
	 * @param proxyParams {Object} Param passed to proxies
	 */
	processProxies(time, proxyParams = {}) {
		if (false && DEBUG) {
			this.proxyParams.ItemTintColor = vec3.fromValues(Math.cos(time * 2) * 0.5 + 0.5, Math.cos(time * 3) * 0.5 + 0.5, Math.cos(time * 5) * 0.5 + 0.5);
		}
		const proxies = this.proxies;
		for (let proxyIndex = 0, l = proxies.length; proxyIndex < l; ++proxyIndex) {
			proxies[proxyIndex].execute(this.variables, proxyParams, time);
		}
		this._afterProcessProxies(proxyParams);
		this.afterProcessProxies(proxyParams);
	}

	_afterProcessProxies(proxyParams) {
		const variables = this.variables;
		const parameters = this.parameters;

		const baseTexture = variables.get('$basetexture');
		if (baseTexture) {
			const texture = Source1TextureManager.getTexture(this.repository, baseTexture, parameters['$frame'] || variables.get('$frame') || 0);
			this.setColorMap(texture);
			// Disable self illum if texture doesn't have alpha channel (fix for D-eye-monds)
			this.setDefine('COLOR_MAP_ALPHA_BITS', String(texture?.getAlphaBits() ?? 0));
		}

		const normalMap = variables.get('$bumpmap') ?? variables.get('$normalmap');
		if (normalMap) {
			this.setNormalMap(Source1TextureManager.getTexture(this.repository, normalMap, 0));
		} else {
			this.setNormalMap(null);
		}

		let envmap = variables.get('$envmap');
		if (envmap) {
			if (envmap == 'env_cubemap') {
				envmap = 'editor/cubemap';//TODO: set default cubmap as a constant
			}
			this.setCubeMap(Source1TextureManager.getTexture(this.repository, envmap, 0, true));
		}

		const baseTextureTransform = variables.get('$basetexturetransform');
		if (baseTextureTransform) {
			this.uniforms['uTextureTransform'] = baseTextureTransform;
			this.setDefine('USE_TEXTURE_TRANSFORM');
		}

		//TODO: remove this
		const phongExponentTexture = variables.get('$phongexponenttexture');
		if (phongExponentTexture) {
			this.setTexture('phongExponentMap', Source1TextureManager.getTexture(this.repository, phongExponentTexture, 0), 'USE_PHONG_EXPONENT_MAP');
		}

		const lightWarpTexture = parameters['$lightwarptexture'];
		this.setTexture('lightWarpMap', lightWarpTexture ? Source1TextureManager.getTexture(this.repository, lightWarpTexture, 0) : null, 'USE_LIGHT_WARP_MAP');


		if (variables.get('$selfillum') == 1) {
			const selfIllumTint = variables.get('$selfillumtint');
			if (selfIllumTint) {
				this.uniforms['uSelfIllumTint'] = selfIllumTint;
			}

			const selfIllumMask = variables.get('$selfillummask');
			if (selfIllumMask) {
				this.setTexture('uSelfIllumMaskMap', Source1TextureManager.getTexture(this.repository, selfIllumMask, 0));
			}
		}

		const detailTexture = variables.get('$detail');
		if (detailTexture) {
			this.setDetailMap(Source1TextureManager.getTexture(this.repository, detailTexture, variables.get('$detailframe') ?? 0));

			const detailTextureTransform = variables.get('$detailtexturetransform');
			if (detailTextureTransform) {
				const textureTransform = GetTextureTransform(detailTextureTransform, this.#detailTextureTransform);
				if (textureTransform) {
					this.variables.set('$detailtexturetransform', textureTransform);
				}
			} else {
				const detailScale = variables.get('$detailscale');
				if (detailScale) {
					MatrixBuildScale(this.#detailTextureTransform, detailScale[0], detailScale[1], 1.0);
					this.setDefine('USE_DETAIL_TEXTURE_TRANSFORM');
					/*let textureTransform = GetTextureTransform(parameters['$basetexturetransform']);
					if (textureTransform) {
						this.variables.set('$basetexturetransform', textureTransform);
						this.uniforms['uTextureTransform'] = textureTransform;
					}*/
				} else {
					this.removeDefine('USE_DETAIL_TEXTURE_TRANSFORM');
				}
			}

			this.setDefine('DETAIL_BLEND_MODE', variables.get('$detailblendmode') ?? 0);
			this.uniforms['uDetailBlendFactor'] = variables.get('$detailblendfactor') ?? 0;
		}



	}

	afterProcessProxies(proxyParams) {

	}

	getAlpha() {
		return clamp(this.variables.get('$alpha'), 0.0, 1.0);
	}
	computeModulationColor(out) {
		const color = this.variables.get('$color');//TODOv3: check variable type
		const color2 = this.variables.get('$color2');//TODOv3: check variable type
		if (color2) {
			out[0] = color[0] * color2[0];
			out[1] = color[1] * color2[1];
			out[2] = color[2] * color2[2];
			out[3] = this.getAlpha();
		} else {
			out[0] = color[0];
			out[1] = color[1];
			out[2] = color[2];
			out[3] = this.getAlpha();
		}
		return out;
	}

	getDefaultParameters() {
		return {};
	}

	sanitizeValue(parameterName, value) {
		const param = VMT_PARAMETERS[parameterName] ?? this.getDefaultParameters()[parameterName];
		if (param) {
			switch (param[0]) {
				case SHADER_PARAM_TYPE_COLOR:
					return readColor(value);
					break;
				case SHADER_PARAM_TYPE_FLOAT:
					const fl = Number(value);
					if (!Number.isNaN(fl)) {
						return fl;
					}
					const c = readColor(value);
					if (c) {
						return c[0];
					}
					return param[1];
					break;
				case SHADER_PARAM_TYPE_INTEGER:
					return Number(value) << 0;
					break;
				case SHADER_PARAM_TYPE_BOOL:
					return Number(value);
					break;
				case SHADER_PARAM_TYPE_STRING:
					return value;
					break;
				case SHADER_PARAM_TYPE_VEC2:
					return readVec2(value);
					break;
			}
		}
		return null;
	}

	setKeyValue(key, value) {
		const sanitized = this.sanitizeValue(key, value);
		if (sanitized) {
			this.variables.set(key, sanitized);
		} else {
			this.variables.set(key, value);
		}
	}

	clone(): SourceEngineMaterial {
		return new SourceEngineMaterial(this.parameters);
	}
}

//TODO: store regexes
export function readColor(value, color?: vec3) {
	color = color || vec3.create();
	// With { } : color values in 0-255 range
	value = value.trim();
	let regex = /\{ *(\d*) *(\d*) *(\d*) *(\d*)* *\}/i;

	let result = regex.exec(value);
	if (result) {
		vec3.set(color, Number(result[1]) / 255.0, Number(result[2]) / 255.0, Number(result[3]) / 255.0);
		return color;
	}

	// With [] : color values in 0.0-1.0 range
	regex = /\[ *(\d*(\.\d*)?) *(\d*(\.\d*)?) *(\d*(\.\d*)?) *\]/i;

	result = regex.exec(value);
	if (result) {
		vec3.set(color, Number(result[1]), Number(result[3]), Number(result[5]));
		return color;
	}

	// With nothing : color values in 0.0-1.0 range
	regex = /^ *(\d*(\.\d*)?) *(\d*(\.\d*)?) *(\d*(\.\d*)?) *$/i;

	result = regex.exec(value);
	if (result) {
		vec3.set(color, Number(result[1]), Number(result[3]), Number(result[5]));
		return color;
	}

	//try a single number
	const n = Number(value);
	if (!Number.isNaN(n)) {
		vec3.set(color, n, n, n);
		return color;
	}
	return null;
}

export function readVec2(value, vec?: vec2) {
	vec = vec || vec2.create();
	const regex = /\[ *(-?\d*(\.\d*)?) *(-?\d*(\.\d*)?) *\]/i;

	const result = regex.exec(value);
	if (result) {
		return vec2.set(vec, Number(result[1]), Number(result[3]));
	}

	const f = Number.parseFloat(value);
	if (Number.isNaN(f)) {
		return;
	}

	return vec2.set(vec, f, f);
}



/*

enum MaterialVarFlags_t
{
	MATERIAL_VAR_DEBUG					  = (1 << 0),
	MATERIAL_VAR_NO_DEBUG_OVERRIDE		  = (1 << 1),
	MATERIAL_VAR_NO_DRAW				  = (1 << 2),
	MATERIAL_VAR_USE_IN_FILLRATE_MODE	  = (1 << 3),

	MATERIAL_VAR_VERTEXCOLOR			  = (1 << 4),
	MATERIAL_VAR_VERTEXALPHA			  = (1 << 5),
	MATERIAL_VAR_SELFILLUM				  = (1 << 6),
	MATERIAL_VAR_ADDITIVE				  = (1 << 7),
	MATERIAL_VAR_ALPHATEST				  = (1 << 8),
	MATERIAL_VAR_MULTIPASS				  = (1 << 9),
	MATERIAL_VAR_ZNEARER				  = (1 << 10),
	MATERIAL_VAR_MODEL					  = (1 << 11),
	MATERIAL_VAR_FLAT					  = (1 << 12),
	MATERIAL_VAR_NOCULL					  = (1 << 13),
	MATERIAL_VAR_NOFOG					  = (1 << 14),
	MATERIAL_VAR_IGNOREZ				  = (1 << 15),
	MATERIAL_VAR_DECAL					  = (1 << 16),
	MATERIAL_VAR_ENVMAPSPHERE			  = (1 << 17),
	MATERIAL_VAR_NOALPHAMOD				  = (1 << 18),
	MATERIAL_VAR_ENVMAPCAMERASPACE	      = (1 << 19),
	MATERIAL_VAR_BASEALPHAENVMAPMASK	  = (1 << 20),
	MATERIAL_VAR_TRANSLUCENT              = (1 << 21),
	MATERIAL_VAR_NORMALMAPALPHAENVMAPMASK = (1 << 22),
	MATERIAL_VAR_NEEDS_SOFTWARE_SKINNING  = (1 << 23),
	MATERIAL_VAR_OPAQUETEXTURE			  = (1 << 24),
	MATERIAL_VAR_ENVMAPMODE				  = (1 << 25),
	MATERIAL_VAR_SUPPRESS_DECALS		  = (1 << 26),
	MATERIAL_VAR_HALFLAMBERT			  = (1 << 27),
	MATERIAL_VAR_WIREFRAME                = (1 << 28),
	MATERIAL_VAR_ALLOWALPHATOCOVERAGE     = (1 << 29),
	MATERIAL_VAR_IGNORE_ALPHA_MODULATION  = (1 << 30),

	// NOTE: Only add flags here that either should be read from
	// .vmts or can be set directly from client code. Other, internal
	// flags should to into the flag enum in imaterialinternal.h
};
*/

/*
static const char* s_pShaderStateString[] =
{
	"$debug",
	"$no_fullbright",
	"$no_draw",
	"$use_in_fillrate_mode",

	"$vertexcolor",
	"$vertexalpha",
	"$selfillum",
	"$additive",
	"$alphatest",
	"$multipass",
	"$znearer",
	"$model",
	"$flat",
	"$nocull",
	"$nofog",
	"$ignorez",
	"$decal",
	"$envmapsphere",
	"$noalphamod",
	"$envmapcameraspace",
	"$basealphaenvmapmask",
	"$translucent",
	"$normalmapalphaenvmapmask",
	"$softwareskin",
	"$opaquetexture",
	"$envmapmode",
	"$nodecal",
	"$halflambert",
	"$wireframe",
	"$allowalphatocoverage",

	""			// last one must be null
};
*/
