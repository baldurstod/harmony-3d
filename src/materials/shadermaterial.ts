import { ShaderManager } from '../managers/shadermanager';
import { GL_FRAGMENT_SHADER, GL_VERTEX_SHADER } from '../webgl/constants';
import { Material } from './material';

let id = 0;

export class ShaderMaterial extends Material {
	#shaderSource: string;
	constructor(params: any = {}) {
		super(params);

		this.shaderSource = params.shaderSource;

		const name = `shadermaterial_${++id}`;
		if (params.vertex) {
			ShaderManager.addSource(GL_VERTEX_SHADER, name + '.vs', params.vertex);
			this.shaderSource = name;
		}
		if (params.fragment) {
			ShaderManager.addSource(GL_FRAGMENT_SHADER, name + '.fs', params.fragment);
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

	set shaderSource(shaderSource) {
		this.#shaderSource = shaderSource;
	}
}
