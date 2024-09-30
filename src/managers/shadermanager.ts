import { ShaderEventTarget } from '../shaders/shadereventtarget';

import { WebGLShaderSource } from '../webgl/shadersource';
import { Shaders } from '../shaders/shaders';

export class ShaderManager {
	static #displayCompileError = false;
	static #htmlCompileError;
	static #htmlCompileErrorContent;
	static #shaderList = new Map();
	static #customShaderList = new Map();

	static addSource(type, name, source) {
		this.#shaderList.set(name, new WebGLShaderSource(type, source));
		ShaderEventTarget.dispatchEvent(new CustomEvent('shaderadded'));
	}

	static getShaderSource(type, name, invalidCustomShaders = false) {
		if (this.#shaderList.get(name) === undefined) {
			let source = Shaders[name];
			if (source) {
				this.addSource(type, name, source);
			} else {
				console.error('Shader not found : ', name);
			}
		}
		const customSource = this.#customShaderList.get(name);
		const source = this.#shaderList.get(name);
		return customSource && (customSource.isValid() || invalidCustomShaders) ? customSource : source;
	}

	static setCustomSource(type, name, source) {
		if (source == '') {
			this.#customShaderList.delete(name);
		} else {
			const customSource = this.#customShaderList.get(name) || new WebGLShaderSource(type, '');
			customSource.setSource(source);
			this.#customShaderList.set(name, customSource);
		}
	}

	static getCustomSourceAnnotations(name) {
		const customSource = this.#customShaderList.get(name);
		if (customSource) {
			return customSource.getCompileError().concat(customSource.getIncludeAnnotations());
		}
		return null;
	}

	static getIncludeAnnotations(includeName) {
		let annotations;
		for (let [shaderName, shaderSource] of this.#shaderList) {
			annotations = this.#getIncludeAnnotations(includeName, shaderName, shaderSource);
			if (annotations.length) {
				return annotations;
			}
		}
		for (let [shaderName, shaderSource] of this.#customShaderList) {
			annotations = this.#getIncludeAnnotations(includeName, shaderName, shaderSource);
			if (annotations.length) {
				return annotations;
			}
		}
	}

	static #getIncludeAnnotations(includeName, shaderName, shaderSource) {
		let errorArray = [];
		if (shaderSource.isErroneous()) {
			if (shaderSource.containsInclude(includeName)) {
				let errors = shaderSource.getCompileError(false);
				for (let error of errors) {
					const sourceRowToInclude = shaderSource.getSourceRowToInclude();
					for (let [startLine, [includeName2, includeLength]] of sourceRowToInclude) {
						//let [includeName2, includeLength] = shaderSource.sourceRowToInclude[startLine];
						if (startLine <= error.row && (startLine + includeLength) > error.row && includeName == includeName2) {
							errorArray.push({type:error.type, column:error.column, row:error.row - startLine, text:error.text});
						}
					}
				}
			}
		}
		return errorArray;
	}

	static get shaderList() {
		return this.#shaderList.keys();
	}

	static resetShadersSource() {
		for (let source of this.#shaderList.values()) {
			source.reset();
		}
		for (let source of this.#customShaderList.values()) {
			source.reset();
		}
	}

	static set displayCompileError(displayCompileError) {
		this.#displayCompileError = displayCompileError;
	}

	static get displayCompileError() {
		return this.#displayCompileError;
	}

	static setCompileError(shaderName, shaderInfoLog) {
		return;
	}
}
