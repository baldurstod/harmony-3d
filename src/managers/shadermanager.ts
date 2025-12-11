import { FinalLine, WgslPreprocessor } from 'wgsl-preprocessor';
import { ShaderEventTarget } from '../shaders/shadereventtarget';
import { Shaders } from '../shaders/shaders';
import { Annotation, WebGLShaderSource } from '../webgl/shadersource';
import { ShaderType } from '../webgl/types';

export class ShaderManager {
	static #displayCompileError = false;
	static #shaderList = new Map<string, WebGLShaderSource>();
	static #customShaderList = new Map<string, WebGLShaderSource>();

	static addSource(type: ShaderType, name: string, source: string) {
		this.#shaderList.set(name, new WebGLShaderSource(type, source));
		ShaderEventTarget.dispatchEvent(new CustomEvent('shaderadded'));
	}

	static getShaderSource(type: ShaderType, name: string, invalidCustomShaders = false): WebGLShaderSource | undefined {
		const shader = this.#shaderList.get(name);
		if (shader === undefined) {
			const source = Shaders[name];
			if (source) {
				this.addSource(type, name, source);
			} else {
				console.error('Shader not found : ', name);
			}
		}
		const customSource = this.#customShaderList.get(name);
		const source = shader;
		return customSource && (customSource.isValid() ?? invalidCustomShaders) ? customSource : source;
	}

	static setCustomSource(type: ShaderType, name: string, source: string) {
		if (source == '') {
			this.#customShaderList.delete(name);
		} else {
			const customSource = this.#customShaderList.get(name) ?? new WebGLShaderSource(type, '');
			customSource.setSource(source);
			this.#customShaderList.set(name, customSource);
		}
	}

	static getCustomSourceAnnotations(name: string) {
		const customSource = this.#customShaderList.get(name);
		if (customSource) {
			return customSource.getCompileError().concat(customSource.getIncludeAnnotations());
		}
		return null;
	}

	static getIncludeAnnotations(includeName: string) {
		let annotations;
		for (const [shaderName, shaderSource] of this.#shaderList) {
			annotations = this.#getIncludeAnnotations(includeName, shaderName, shaderSource);
			if (annotations.length) {
				return annotations;
			}
		}
		for (const [shaderName, shaderSource] of this.#customShaderList) {
			annotations = this.#getIncludeAnnotations(includeName, shaderName, shaderSource);
			if (annotations.length) {
				return annotations;
			}
		}
	}

	static #getIncludeAnnotations(includeName: string, shaderName: string, shaderSource: WebGLShaderSource): Annotation[] {
		if (shaderSource.getType() == ShaderType.Wgsl) {
			return this.#getIncludeAnnotationsWgsl(includeName, shaderName, shaderSource);
		} else {
			return this.#getIncludeAnnotationsGlsl(includeName, shaderName, shaderSource);
		}
	}

	static #getIncludeAnnotationsGlsl(includeName: string, shaderName: string, shaderSource: WebGLShaderSource) {
		const errorArray = [];
		if (shaderSource.isErroneous()) {
			if (shaderSource.containsInclude(includeName)) {
				const errors = shaderSource.getCompileError(false);
				for (const error of errors) {
					const sourceRowToInclude = shaderSource.getSourceRowToInclude();
					for (const [startLine, [includeName2, includeLength]] of sourceRowToInclude) {
						//let [includeName2, includeLength] = shaderSource.sourceRowToInclude[startLine];
						if (startLine <= error.row && (startLine + includeLength) > error.row && includeName == includeName2) {
							errorArray.push({ type: error.type, column: error.column, row: error.row - startLine, text: error.text });
						}
					}
				}
			}
		}
		return errorArray;
	}

	static #getIncludeAnnotationsWgsl(includeName: string, shaderName: string, shaderSource: WebGLShaderSource): Annotation[] {
		function findInclude(line: FinalLine): FinalLine | null {
			if (line.sourceName == includeName) {
				return line;
			}

			if (line.includeLine) {
				return findInclude(line.includeLine);
			}
			return null;
		}

		const errorArray: Annotation[] = [];
		if (shaderSource.isErroneous()) {
			if (shaderSource.containsInclude(includeName)) {

				const lines = WgslPreprocessor.preprocessWgslLineMap(shaderSource.getOriginSource());
				const errors = shaderSource.getCompileError(false);
				for (const error of errors) {
					const line = lines[error.row - 1];
					if (!line) {
						continue;
					}
					const includeLine = findInclude(line);
					if (includeLine) {
						errorArray.push({ type: error.type, column: error.column, row: includeLine.originLine, text: error.text });
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
		for (const source of this.#shaderList.values()) {
			source.reset();
		}
		for (const source of this.#customShaderList.values()) {
			source.reset();
		}
	}

	static set displayCompileError(displayCompileError) {
		this.#displayCompileError = displayCompileError;
	}

	static get displayCompileError() {
		return this.#displayCompileError;
	}

	static setCompileError(shaderName: string, shaderInfoLog: string) {
		return;
	}
}
