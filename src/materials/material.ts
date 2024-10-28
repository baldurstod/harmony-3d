import { vec2, vec4 } from 'gl-matrix';

import { GL_LESS, GL_ONE, GL_ZERO, GL_DEPTH_TEST, GL_BLEND, GL_FUNC_ADD, GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA, GL_SRC_COLOR, GL_ONE_MINUS_SRC_COLOR } from '../webgl/constants';
import { GL_FRONT, GL_BACK, GL_FRONT_AND_BACK } from '../webgl/constants';
import { TESTING } from '../buildoptions';
import { MateriaParameter } from './materialparameter';
import { Texture } from '../textures/texture';
import { BlendingMode, RenderFace } from './constants';
import { registerEntity } from '../entities/entities';

export const MATERIAL_BLENDING_NONE = 0;
export const MATERIAL_BLENDING_NORMAL = 1;
export const MATERIAL_BLENDING_ADDITIVE = 2;
export const MATERIAL_BLENDING_SUBSTRACTIVE = 3;
export const MATERIAL_BLENDING_MULTIPLY = 4;

export const MATERIAL_CULLING_NONE = 0;
export const MATERIAL_CULLING_FRONT = GL_FRONT;
export const MATERIAL_CULLING_BACK = GL_BACK;
export const MATERIAL_CULLING_FRONT_AND_BACK = GL_FRONT_AND_BACK;

export const MATERIAL_COLOR_NONE = 0;
export const MATERIAL_COLOR_PER_VERTEX = 1;
export const MATERIAL_COLOR_PER_MESH = 2;

export const DEFAULT_COLOR = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
export const DEFAULT_CULLING_MODE = MATERIAL_CULLING_BACK;

export class Material {
	id: string;
	name: string;
	#renderFace = RenderFace.Front;
	#renderLights = true;
	#color = vec4.create();
	#alphaTest;
	#alphaTestReference;
	#cullingMode;
	#users = new Set();
	#parameters = new Map();
	uniforms: any = {};
	defines: any;
	parameters: any;
	depthTest: boolean;
	depthFunc: any;
	depthMask: boolean;
	colorMask: vec4;
	blend: boolean = false;
	srcRGB: any;
	dstRGB: any;
	srcAlpha: any;
	dstAlpha: any;
	modeRGB: any;
	modeAlpha: any;
	polygonOffset: boolean;
	polygonOffsetFactor: number;
	polygonOffsetUnits: number;
	_dirtyProgram: boolean;
	disableCulling: boolean;
	cullMode: any;
	#colorMode: any;
	colorMap?: Texture;
	properties = new Map<string, any>();

	static materialList = {};
	constructor(params: any = {}) {
		this.defines = {};//TODOv3: put defines in meshes too ?

		this.parameters = params;
		this.depthTest = params.depthTest ?? true;
		this.depthFunc = GL_LESS;
		this.depthMask = true;

		this.colorMask = vec4.fromValues(1.0, 1.0, 1.0, 1.0);

		this.srcRGB = GL_ONE;
		this.dstRGB = GL_ZERO;
		this.srcAlpha = GL_ONE;
		this.dstAlpha = GL_ZERO;
		this.modeRGB = GL_FUNC_ADD;
		this.modeAlpha = GL_FUNC_ADD;

		//this.culling = parameters.culling ?? DEFAULT_CULLING_MODE;
		if (params.culling) {
			throw 'handle me';
		}

		this.colorMode = MATERIAL_COLOR_NONE;
		this.color = DEFAULT_COLOR;

		this.polygonOffset = params.polygonOffset ?? false;
		this.polygonOffsetFactor = params.polygonpolygonOffsetFactorOffset ?? -5;
		this.polygonOffsetUnits = params.polygonOffsetUnits ?? -5;

		this._dirtyProgram = true;//TODOv3 use another method
	}

	get transparent() {
		return this.blend;
	}

	set renderLights(renderLights) {
		this.#renderLights = renderLights;
	}

	get renderLights() {
		return this.#renderLights;
	}

	setDefine(define: string, value: string = '') {
		if (this.defines[define] !== value) {
			this.defines[define] = value;
			this._dirtyProgram = true;//TODOv3: invalidate program here ?
		}
	}

	removeDefine(define) {
		if (this.defines[define] !== undefined) {
			delete this.defines[define];
			this._dirtyProgram = true;//TODOv3: invalidate program here ?
		}
	}

	setValues(values) {//fixme//TODOv3
		if (values === undefined) return;

		for (var key in values) {

		}

	}

	clone() {
		console.error('cant\'t clone Material, missing clone() in ' + this.constructor.name);
		//return new this.constructor(this.parameters);
	}

	setTransparency(srcRGB, dstRGB, srcAlpha?, dstAlpha?) {
		this.blend = true;
		this.depthMask = false;
		this.srcRGB = srcRGB;
		this.dstRGB = dstRGB;
		this.srcAlpha = srcAlpha || srcRGB;
		this.dstAlpha = dstAlpha || dstRGB;
	}

	setBlending(mode: BlendingMode, premultipliedAlpha: boolean = false) {
		if (premultipliedAlpha) {
			switch (mode) {
				case BlendingMode.None:
					this.blend = false;
					break;
				case BlendingMode.Normal:
					this.setTransparency(GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
					break;
				case BlendingMode.Additive:
					this.setTransparency(GL_ONE, GL_ONE);
					break;
				case BlendingMode.Substractive:
					this.setTransparency(GL_ZERO, GL_ZERO, GL_ONE_MINUS_SRC_COLOR, GL_ONE_MINUS_SRC_ALPHA);
					break;
				case BlendingMode.Multiply:
					this.setTransparency(GL_ZERO, GL_SRC_COLOR, GL_ZERO, GL_SRC_ALPHA);
					break;
			}
		} else {
			switch (mode) {
				case BlendingMode.None:
					this.blend = false;
					break;
				case BlendingMode.Normal:
					this.setTransparency(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA, GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
					break;
				case BlendingMode.Additive:
					this.setTransparency(GL_SRC_ALPHA, GL_ONE);
					break;
				case BlendingMode.Substractive:
					this.setTransparency(GL_ZERO, GL_ONE_MINUS_SRC_COLOR);
					break;
				case BlendingMode.Multiply:
					this.setTransparency(GL_ZERO, GL_SRC_COLOR);
					break;
			}
		}
	}

	updateMaterial(time, mesh) {

	}


	beforeRender(camera) {//TODO: check params

	}

	set culling(mode) {
		throw 'deprecated';
		this.#cullingMode = mode;
		if (mode === MATERIAL_CULLING_NONE) {
			this.setDefine('CULLING_DISABLED');
			this.removeDefine('REVERSE_CULLING');
			this.disableCulling = true;
		} else {
			this.disableCulling = false;
			this.cullMode = mode;
			this.removeDefine('CULLING_DISABLED');
			mode === MATERIAL_CULLING_BACK ? this.removeDefine('REVERSE_CULLING') : this.setDefine('REVERSE_CULLING');
		}
	}

	renderFace(renderFace: RenderFace) {
		this.#renderFace = renderFace;

		if (renderFace == RenderFace.Both) {
			this.setDefine('CULLING_DISABLED');
			this.removeDefine('REVERSE_CULLING');
		} else {
			this.removeDefine('CULLING_DISABLED');
			if (renderFace == RenderFace.Front) {
				this.removeDefine('REVERSE_CULLING');
			} else {
				this.setDefine('REVERSE_CULLING');
			}
		}
	}

	getRenderFace() {
		return this.#renderFace;
	}

	setColorMode(colorMode) {
		this.#colorMode = colorMode;
		switch (colorMode) {
			case MATERIAL_COLOR_NONE:
				this.removeDefine('USE_VERTEX_COLOR');
				this.removeDefine('USE_MESH_COLOR');
				break;
			case MATERIAL_COLOR_PER_VERTEX:
				this.setDefine('USE_VERTEX_COLOR');
				this.removeDefine('USE_MESH_COLOR');
				break;
			case MATERIAL_COLOR_PER_MESH:
				this.removeDefine('USE_VERTEX_COLOR');
				this.setDefine('USE_MESH_COLOR');
				break;
		}
	}

	set colorMode(colorMode) {
		this.setColorMode(colorMode);
	}

	get colorMode() {
		return this.#colorMode;
	}

	setColor(color: vec4) {
		vec4.copy(this.#color, color);
		this.uniforms['uColor'] = this.#color;
	}

	set color(color) {
		this.setColor(color);
	}

	get color() {
		return vec4.clone(this.#color);
	}

	setMeshColor(color = DEFAULT_COLOR) {//Note that some shaders may not provide per mesh color
		this.colorMode = MATERIAL_COLOR_PER_MESH;
		this.color = color;
	}

	setTexture(uniformName: string, texture: Texture, shaderDefine?: string) {
		let previousTexture = this.uniforms[uniformName];
		if (previousTexture != texture) {
			if (previousTexture) {
				previousTexture.removeUser(this);
			}
			if (texture) {
				texture.addUser(this);
				this.uniforms[uniformName] = texture;
				if (shaderDefine) {
					this.setDefine(shaderDefine);
				}
			} else {
				this.uniforms[uniformName] = null;
				if (shaderDefine) {
					this.removeDefine(shaderDefine);
				}
			}
		}
	}

	setTextureArray(uniformName, textureArray) {
		let previousTextureArray = this.uniforms[uniformName];
		let keepMe = new Set();
		if (textureArray) {
			textureArray.forEach(texture => {
				if (texture) {
					texture.addUser(this);
					keepMe.add(texture);
				}
			});
			this.uniforms[uniformName] = textureArray;
		} else {
			this.uniforms[uniformName] = null;
		}
		if (previousTextureArray) {
			previousTextureArray.forEach(texture => {
				if (texture && !keepMe.has(texture)) {
					texture.removeUser(this);
				}
			});
		}
	}

	setColorMap(texture) {
		this.setTexture('colorMap', texture, 'USE_COLOR_MAP');
		this.colorMap = texture;
	}

	setColor2Map(texture) {
		this.setTexture('color2Map', texture, 'USE_COLOR2_MAP');
	}

	setDetailMap(texture) {
		this.setTexture('detailMap', texture, 'USE_DETAIL_MAP');
	}

	setNormalMap(texture) {
		this.setTexture('normalMap', texture, 'USE_NORMAL_MAP');
	}

	setCubeMap(texture) {
		this.setTexture('cubeMap', texture, 'USE_CUBE_MAP');
	}

	set alphaTest(alphaTest) {
		this.#alphaTest = alphaTest;
		this.#setAlphaTest();
	}

	set alphaTestReference(alphaTestReference) {
		this.#alphaTestReference = alphaTestReference;
		this.#setAlphaTest();
	}

	#setAlphaTest() {
		if (this.#alphaTest) {
			this.setDefine('ALPHA_TEST');
			this.uniforms['uAlphaTestReference'] = this.#alphaTestReference ?? 0.5;
			this.depthMask = true;
		} else {
			this.removeDefine('ALPHA_TEST');
		}
	}

	getColorMapSize(size = vec2.create()) {
		if (this.colorMap) {
			size[0] = this.colorMap.width;
			size[1] = this.colorMap.height;
		}
		return size;
	}

	addParameter(name, type, value, changed) {
		const param = new MateriaParameter(name, type, value, changed);
		this.#parameters.set(name, param);
		return param;
	}

	removeParameter(name) {
		this.#parameters.delete(name);
	}

	getParameter(name) {
		this.#parameters.get(name);
	}

	setParameterValue(name, value) {
		const parameter = this.#parameters.get(name);
		if (parameter !== undefined) {
			parameter.setValue(value);
		}
	}

	setColor4Uniform(uniformName, value) {
		this.uniforms[uniformName] = value;
	}

	toJSON() {
		let json: any = {
			constructor: (this.constructor as typeof Material).getEntityName(),
		};
		//TODO
		json.parameters = this.parameters;
		json.color = this.color;
		json.colormode = this.colorMode;
		json.alphatest = this.#alphaTest;
		json.alphaTestReference = this.#alphaTestReference;

		if (this.#renderFace != RenderFace.Front) {
			json.render_face = this.#renderFace;
		}


		return json;
	}

	static async constructFromJSON(json) {
		return new Material(json.parameters);
	}

	fromJSON(json) {
		this.color = json.color;
		this.colorMode = json.colormode;
		this.alphaTest = json.alphatest;
		this.alphaTestReference = json.alphaTestReference;
		this.renderFace(json.render_face ?? RenderFace.Front);
	}

	addUser(user) {
		this.#users.add(user);
	}

	removeUser(user) {
		this.#users.delete(user);
		this.dispose();
	}

	hasNoUser() {
		return this.#users.size == 0;
	}

	#disposeUniform(uniform) {
		if (Array.isArray(uniform)) {
			uniform.forEach((subValue) => this.#disposeUniform(subValue));
		} else if (uniform && uniform.isTexture) {
			uniform.removeUser(this);
		}
	}

	dispose() {
		if (this.hasNoUser()) {
			if (TESTING) {
				console.info('Material has no more users, deleting', this);
			}
			let uniforms = this.uniforms;
			let uniformArray = Object.keys(uniforms);
			for (let uniformName of uniformArray) {
				let uniform = uniforms[uniformName];
				this.#disposeUniform(uniform);
			}
		}
	}

	static getEntityName(): string {
		return 'Material';
	}

	get shaderSource(): string {
		// TODO: remove this
		throw 'get shaderSource() must be overridden';
	}

	getShaderSource(): string {
		return this.shaderSource;
	}
}
registerEntity(Material);
