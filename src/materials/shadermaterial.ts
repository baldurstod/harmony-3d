import { ShaderManager } from '../managers/shadermanager';
import { ShaderType } from '../webgl/types';
import { Material, MaterialParams, MaterialUniform } from './material';

let id = 0;

export type ShaderMaterialParams = MaterialParams & {
	// Name of an existing shader
	shaderSource?: string;
	// Source of the WebGL shader
	glsl?: { vertex: string, fragment: string };
	// Source of the WebGPU shader
	wgsl?: string;
};

export class ShaderMaterial extends Material {
	readonly #shaderSource: string = '';

	constructor(params: ShaderMaterialParams = {}) {
		super(params);

		if (params.shaderSource) {
			this.#shaderSource = params.shaderSource;
		}

		const name = `shadermaterial_${++id}`;
		if (params.glsl) {
			ShaderManager.addSource(ShaderType.Vertex, name + '.vs', params.glsl.vertex);
			ShaderManager.addSource(ShaderType.Fragment, name + '.fs', params.glsl.fragment);
			this.#shaderSource = name;
		}
		if (params.wgsl) {
			ShaderManager.addSource(ShaderType.Wgsl, name + '.wgsl', params.wgsl);
			this.#shaderSource = name;
		}
	}

	override getShaderSource(): string {
		return this.#shaderSource;
	}
}
