import { vec2, vec4 } from 'gl-matrix';
import { JSONObject } from 'harmony-types';
import { TESTING } from '../buildoptions';
import { Camera } from '../cameras/camera';
import { registerEntity } from '../entities/entities';
import { BlendingFactor, BlendingFactorWebGPU } from '../enums/blending';
import { Mesh } from '../objects/mesh';
import { Texture } from '../textures/texture';
import { GL_BACK, GL_FRONT, GL_FRONT_AND_BACK, GL_FUNC_ADD, GL_LESS, GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_ONE_MINUS_SRC_COLOR, GL_SRC_ALPHA, GL_SRC_COLOR, GL_ZERO } from '../webgl/constants';
import { UniformValue } from '../webgl/uniform';
import { BlendingMode, RenderFace } from './constants';
import { MateriaParameter, MateriaParameterType, MateriaParameterValue, ParameterChanged } from './materialparameter';

export const MATERIAL_BLENDING_NONE = 0;
export const MATERIAL_BLENDING_NORMAL = 1;
export const MATERIAL_BLENDING_ADDITIVE = 2;
export const MATERIAL_BLENDING_SUBSTRACTIVE = 3;
export const MATERIAL_BLENDING_MULTIPLY = 4;

export const MATERIAL_CULLING_NONE = 0;
export const MATERIAL_CULLING_FRONT = GL_FRONT;
export const MATERIAL_CULLING_BACK = GL_BACK;
export const MATERIAL_CULLING_FRONT_AND_BACK = GL_FRONT_AND_BACK;

export enum MaterialColorMode {
	None = 0,
	PerVertex,
	PerMesh,
}

export const DEFAULT_COLOR = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
export const DEFAULT_CULLING_MODE = MATERIAL_CULLING_BACK;

//export type UniformValue = boolean | number | boolean[] | number[] | vec2 | vec3 | vec4 | Texture | Texture[] | null;
//export type BlendFuncSeparateFactor = typeof GL_ZERO | typeof GL_ONE | typeof GL_SRC_COLOR | typeof GL_ONE_MINUS_SRC_COLOR | typeof GL_DST_COLOR | typeof GL_ONE_MINUS_DST_COLOR | typeof GL_SRC_ALPHA | typeof GL_ONE_MINUS_SRC_ALPHA | typeof GL_DST_ALPHA | typeof GL_ONE_MINUS_DST_ALPHA | typeof GL_CONSTANT_COLOR | typeof GL_ONE_MINUS_CONSTANT_COLOR | typeof GL_CONSTANT_ALPHA | typeof GL_ONE_MINUS_CONSTANT_ALPHA | typeof GL_SRC_ALPHA_SATURATE;

export type MaterialParams = {
	name?: string;
	depthTest?: boolean;
	depthWrite?: boolean;
	renderFace?: RenderFace;
	polygonOffset?: boolean;
	polygonOffsetFactor?: number;
	polygonOffsetUnits?: number;

}/*TODO: create proper type*/;

export type MaterialUniform = Record<string, UniformValue | Record<string, UniformValue>>;

export class Material {
	id = '';
	name = '';
	#renderFace = RenderFace.Front;
	#renderLights = true;
	#color = vec4.create();
	#alphaTest = false;
	#alphaTestReference = 0;
	#users = new Set<any>();
	#parameters = new Map<string, MateriaParameter>();
	uniforms: MaterialUniform = {};// TODO: transform to map ?
	defines: Record<string, any> = {};//TODOv3: put defines in meshes too ? TODO: transform to map ?
	parameters: MaterialParams;
	depthTest: boolean;
	depthFunc: any;
	depthMask = true;
	colorMask: vec4;
	blend = false;
	srcRGB: BlendingFactor = BlendingFactor.One;
	dstRGB: BlendingFactor = BlendingFactor.Zero;
	srcAlpha: BlendingFactor = BlendingFactor.One;
	dstAlpha: BlendingFactor = BlendingFactor.Zero;
	modeRGB: any;//TODO: create type like above
	modeAlpha: any;
	polygonOffset: boolean;
	polygonOffsetFactor: number;
	polygonOffsetUnits: number;
	_dirtyProgram: boolean;
	#colorMode: MaterialColorMode = MaterialColorMode.None;
	colorMap: Texture | null = null;
	properties = new Map<string, any>();
	static materialList: Record<string, typeof Material> = {};

	constructor(params: MaterialParams = {}) {
		this.parameters = params;
		this.depthTest = params.depthTest ?? true;
		this.depthFunc = GL_LESS;

		this.colorMask = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
		this.modeRGB = GL_FUNC_ADD;
		this.modeAlpha = GL_FUNC_ADD;

		//this.culling = parameters.culling ?? DEFAULT_CULLING_MODE;

		this.color = DEFAULT_COLOR;

		this.polygonOffset = params.polygonOffset ?? false;
		this.polygonOffsetFactor = params.polygonOffsetFactor ?? -5;
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

	setDefine(define: string, value = '') {
		if (this.defines[define] !== value) {
			this.defines[define] = value;
			this._dirtyProgram = true;//TODOv3: invalidate program here ?
		}
	}

	removeDefine(define: string) {
		if (this.defines[define] !== undefined) {
			delete this.defines[define];
			this._dirtyProgram = true;//TODOv3: invalidate program here ?
		}
	}

	setValues(values: any) {// TODO: remove, seems to be useless
		if (values === undefined) return;

		for (const key in values) {

		}

	}

	clone(): unknown {
		throw 'cant\'t clone Material, missing clone() in ' + this.constructor.name;
		//return new this.constructor(this.parameters);
	}

	setTransparency(srcRGB: BlendingFactor, dstRGB: BlendingFactor, srcAlpha?: BlendingFactor, dstAlpha?: BlendingFactor) {
		this.blend = true;
		this.depthMask = false;
		this.srcRGB = srcRGB;
		this.dstRGB = dstRGB;
		this.srcAlpha = srcAlpha ?? srcRGB;
		this.dstAlpha = dstAlpha ?? dstRGB;
	}

	setBlending(mode: BlendingMode, premultipliedAlpha = false) {
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

	updateMaterial(time: number, mesh: Mesh) {

	}


	beforeRender(camera: Camera) {//TODO: check params

	}

	/**
	 * @deprecated Please use `renderFace` instead.
	 */
	set culling(mode: number) {
		throw 'deprecated';
		/*
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
		*/
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

	getWebGPUCullMode(): GPUCullMode {
		switch (this.#renderFace) {
			case RenderFace.Front:
				return 'back';
			case RenderFace.Back:
				return 'front';
			case RenderFace.None:
				// Not supported for webgpu
				break;
		}
		return 'none';
	}

	getWebGPUBlending(): GPUBlendState | undefined {
		if (!this.blend) {
			return undefined;
		}

		return {
			color: {
				srcFactor: BlendingFactorWebGPU.get(this.srcRGB) ?? 'one',
				dstFactor: BlendingFactorWebGPU.get(this.dstRGB) ?? 'one-minus-src-alpha'
			},
			alpha: {
				srcFactor: BlendingFactorWebGPU.get(this.srcAlpha) ?? 'one',
				dstFactor: BlendingFactorWebGPU.get(this.dstAlpha) ?? 'one-minus-src-alpha'
			},
		};
	}

	setColorMode(colorMode: MaterialColorMode) {
		this.#colorMode = colorMode;
		switch (colorMode) {
			case MaterialColorMode.None:
				this.removeDefine('USE_VERTEX_COLOR');
				this.removeDefine('USE_MESH_COLOR');
				break;
			case MaterialColorMode.PerVertex:
				this.setDefine('USE_VERTEX_COLOR');
				this.removeDefine('USE_MESH_COLOR');
				break;
			case MaterialColorMode.PerMesh:
				this.removeDefine('USE_VERTEX_COLOR');
				this.setDefine('USE_MESH_COLOR');
				break;
		}
	}

	getColorMode(): MaterialColorMode {
		return this.#colorMode;
	}

	/**
	 * @deprecated Please use `setColorMode` instead.
	 */
	set colorMode(colorMode: MaterialColorMode) {
		this.setColorMode(colorMode);
	}

	/**
	 * @deprecated Please use `getColorMode` instead.
	 */
	get colorMode() {
		return this.getColorMode();
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
		this.setColorMode(MaterialColorMode.PerMesh);
		this.color = color;
	}

	setTexture(uniformName: string, texture: Texture | null, shaderDefine?: string) {
		const previousTexture = this.uniforms[uniformName] as Texture;
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

	setTextureArray(uniformName: string, textureArray: Texture[]) {
		const previousTextureArray: Texture[] | undefined = this.uniforms[uniformName] as Texture[];
		const keepMe = new Set<Texture>();
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

	setColorMap(texture: Texture | null) {
		this.setTexture('colorMap', texture, 'USE_COLOR_MAP');
		this.colorMap = texture;
	}

	setColor2Map(texture: Texture | null) {
		this.setTexture('color2Map', texture, 'USE_COLOR2_MAP');
	}

	setDetailMap(texture: Texture | null) {
		this.setTexture('detailTexture', texture, 'USE_DETAIL_MAP');
	}

	setNormalMap(texture: Texture | null) {
		this.setTexture('normalTexture', texture, 'USE_NORMAL_MAP');
	}

	setCubeMap(texture: Texture | null) {
		this.setTexture('cubeTexture', texture, 'USE_CUBE_MAP');
	}

	setAlphaTest(alphaTest: boolean) {
		this.#alphaTest = alphaTest;
		this.#setAlphaTest();
	}

	/**
	 * @deprecated Please use `setAlphaTest` instead.
	 */
	set alphaTest(alphaTest: boolean) {
		this.setAlphaTest(alphaTest);
	}

	setAlphaTestReference(alphaTestReference: number) {
		this.#alphaTestReference = alphaTestReference;
		this.#setAlphaTest();
	}

	/**
	 * @deprecated Please use `setAlphaTestReference` instead.
	 */
	set alphaTestReference(alphaTestReference: number) {
		this.setAlphaTestReference(alphaTestReference);
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

	addParameter(name: string, type: MateriaParameterType, value: any, changed?: ParameterChanged) {
		const param = new MateriaParameter(name, type, value, changed);
		this.#parameters.set(name, param);
		return param;
	}

	removeParameter(name: string) {
		this.#parameters.delete(name);
	}

	getParameter(name: string): MateriaParameter | undefined {
		return this.#parameters.get(name);
	}

	setParameterValue(name: string, value: MateriaParameterValue) {
		const parameter = this.#parameters.get(name);
		if (parameter !== undefined) {
			parameter.setValue(value);
		}
	}

	setColor4Uniform(uniformName: string, value: UniformValue) {
		this.uniforms[uniformName] = value;
	}

	toJSON() {
		const json: any = {
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

	static async constructFromJSON(json: JSONObject) {
		return new Material(json.parameters as MaterialParams/*TODO: check validity*/);
	}

	fromJSON(json: JSONObject) {
		this.color = json.color as vec4;
		this.setColorMode(json.colormode as MaterialColorMode);
		this.setAlphaTest(json.alphatest as boolean);
		this.setAlphaTestReference(json.alphaTestReference as number);
		this.renderFace(json.render_face as RenderFace ?? RenderFace.Front);
	}

	addUser(user: any) {
		this.#users.add(user);
	}

	removeUser(user: any) {
		this.#users.delete(user);
		this.dispose();
	}

	hasNoUser() {
		return this.#users.size == 0;
	}

	#disposeUniform(uniform: UniformValue | Record<string, UniformValue>) {
		if (Array.isArray(uniform)) {
			uniform.forEach((subValue) => this.#disposeUniform(subValue));
		} else {
			(uniform as any)?.removeUser?.(this);
		}
	}

	dispose() {
		if (this.hasNoUser()) {
			if (TESTING) {
				console.info('Material has no more users, deleting', this);
			}
			const uniforms = this.uniforms;
			const uniformArray = Object.keys(uniforms);
			for (const uniformName of uniformArray) {
				const uniform = uniforms[uniformName]!;
				this.#disposeUniform(uniform);
			}
		}
	}

	static getEntityName(): string {
		return 'Material';
	}

	get shaderSource(): string {//TODO: deprecate
		// TODO: remove this
		throw 'get shaderSource() must be overridden';
	}

	getShaderSource(): string {
		return this.shaderSource;
	}

	getWebGPUShader(): string {
		throw new Error('Override this function');
	}
}
registerEntity(Material);
