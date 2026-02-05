import { ShaderManager } from '../managers/shadermanager';
import { GL_FRAGMENT_SHADER, GL_VERTEX_SHADER } from '../webgl/constants';
import { Material, MaterialParams, MaterialUniform } from './material';

let id = 0;

export type ShaderMaterialParams = MaterialParams & {
	// Name of an existing shader
	shaderSource?: string;
	// Source of the WebGL shader
	glsl?: { vertex: string, fragment: string };
	// Source of the WebGPU shader
	wgsl?: string;

	uniforms?: MaterialUniform;
	defines?: Record<string, string>;
};

export class ShaderMaterial extends Material {
	readonly #shaderSource: string = '';

	constructor(params: ShaderMaterialParams = {}) {
		super(params);

		if (params.shaderSource) {
			this.#shaderSource = params.shaderSource;
		}

		const name = `shadermaterial_${++id}`;
		if (params.glsl?.vertex) {
			ShaderManager.addSource(GL_VERTEX_SHADER, name + '.vs', params.glsl.vertex);
			this.#shaderSource = name;
		}
		if (params.glsl?.fragment) {
			ShaderManager.addSource(GL_FRAGMENT_SHADER, name + '.fs', params.glsl.fragment);
		}

		if (params.uniforms) {
			for (const name in params.uniforms) {
				this.uniforms[name] = params.uniforms[name];
			}
		}

		if (params.defines) {
			for (const name in params.defines) {
				this.setDefine(name, params.defines[name]);
			}
		}
	}

	getShaderSource(): string {
		return this.#shaderSource;
	}
}
