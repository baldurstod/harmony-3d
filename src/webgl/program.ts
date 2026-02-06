import { DEBUG, ENABLE_GET_ERROR } from '../buildoptions';
import { ShaderManager } from '../managers/shadermanager';
import { WebGLAnyRenderingContext } from '../types';
import { GL_FRAGMENT_SHADER, GL_VERTEX_SHADER } from './constants';
import { WebGLShaderSource } from './shadersource';
import { ShaderType } from './types';
import { Uniform, UniformValue } from './uniform';

export class Program {
	#glContext: WebGLAnyRenderingContext
	#program: WebGLProgram;
	#vs: WebGLShader;
	#fs: WebGLShader;
	#vertexShaderName: string
	#fragmentShaderName: string
	#valid = false;
	attributes = new Map<string, GLint>();
	uniforms = new Map<string, Uniform>();
	#linkError: string | null = '';

	constructor(glContext: WebGLAnyRenderingContext, vertexShaderName: string, fragmentShaderName: string) {
		this.#glContext = glContext;
		this.#program = glContext.createProgram();
		this.#vs = glContext.createShader(GL_VERTEX_SHADER) as WebGLShader;
		this.#fs = glContext.createShader(GL_FRAGMENT_SHADER) as WebGLShader;
		this.#vertexShaderName = vertexShaderName;
		this.#fragmentShaderName = fragmentShaderName;
		glContext.attachShader(this.#program, this.#vs);
		glContext.attachShader(this.#program, this.#fs);
	}

	setUniformValue(name: string, value: UniformValue): void {
		const uniform = this.uniforms.get(name);
		if (uniform) {
			uniform.setValue(this.#glContext, value);
			if (ENABLE_GET_ERROR && DEBUG) {
				const error = this.#glContext.getError();
				if (error) {
					console.error('Error setting uniform : ', error, name, value);
				}
			}
		}
	}

	validate(includeCode: string): boolean {//TODO: remove include code
		const vertexShaderScript = ShaderManager.getShaderSource(ShaderType.Vertex, this.#vertexShaderName);
		const fragmentShaderScript = ShaderManager.getShaderSource(ShaderType.Fragment, this.#fragmentShaderName);

		if (vertexShaderScript && fragmentShaderScript && vertexShaderScript.isValid() && fragmentShaderScript.isValid()) {
			const vsOk = this.#compileShader(this.#vs, this.#vertexShaderName, vertexShaderScript, includeCode);
			const fsOk = vsOk && this.#compileShader(this.#fs, this.#fragmentShaderName, fragmentShaderScript, includeCode);
			if (fsOk) {
				this.#glContext.linkProgram(this.#program);

				if (!this.#glContext.getProgramParameter(this.#program, this.#glContext.LINK_STATUS)) {
					const linkError = this.#glContext.getProgramInfoLog(this.#program);
					if (this.#linkError != linkError) {
						console.error(`Failed linking program for ${this.#vertexShaderName} and ${this.#fragmentShaderName}`);
						console.error('Reason : ' + linkError);
						this.#linkError = linkError;
					}
					return false;
				} else {
					this.#linkError = '';
				}
				this.#initProgram();
				this.#valid = true;
			}
		}
		return false;
	}

	invalidate(): void {
		this.#valid = false;
	}

	isValid(): boolean {
		return this.#valid;
	}

	getProgram(): WebGLProgram {
		return this.#program;
	}

	#initProgram(): void {
		this.attributes.clear();
		this.uniforms.clear();
		const activeAttributes: GLint = this.#glContext.getProgramParameter(this.#program, this.#glContext.ACTIVE_ATTRIBUTES) as GLint;
		for (let i = 0; i < activeAttributes; i++) {
			const attribInfo = this.#glContext.getActiveAttrib(this.#program, i);
			if (attribInfo) {
				this.#setProgramAttribute(attribInfo.name);
			}
		}

		const activeUniforms: GLint = this.#glContext.getProgramParameter(this.#program, this.#glContext.ACTIVE_UNIFORMS) as GLint;
		for (let i = 0; i < activeUniforms; i++) {
			const uniformInfo = this.#glContext.getActiveUniform(this.#program, i);
			if (uniformInfo) {
				this.#setProgramUniform(uniformInfo);
			}
		}

		let samplerId = 0;
		for (const [, uniform] of this.uniforms) {
			if (uniform.isTextureSampler()) {
				uniform.setTextureUnit(samplerId);//setValue(this.#glContext, samplerId);
				samplerId += uniform.getSize();
			}
		}
	}

	#setProgramAttribute(attributeName: string): void {
		const attributeLocation = this.#glContext.getAttribLocation(this.#program, attributeName);
		this.attributes.set(attributeName, attributeLocation);//TODO: set in attributes ?
	}

	#setProgramUniform(uniformInfo: WebGLActiveInfo): void {
		const uniformLocation = this.#glContext.getUniformLocation(this.#program, uniformInfo.name);
		if (uniformLocation) {
			this.uniforms.set(uniformInfo.name, new Uniform(uniformInfo, uniformLocation));
		}
	}

	#compileShader(shader: WebGLShader, shaderName: string, shaderSource: WebGLShaderSource, includeCode: string): boolean {
		if (!shaderSource || !shaderSource.isValid()) {
			return false;
		}

		const compileSource = shaderSource.getCompileSource(includeCode);
		this.#glContext.shaderSource(shader, compileSource);
		this.#glContext.compileShader(shader);

		if (!this.#glContext.getShaderParameter(shader, this.#glContext.COMPILE_STATUS)) {
			const shaderInfoLog = this.#glContext.getShaderInfoLog(shader);
			const m = 'Compile error in ' + shaderName + '. Reason : ' + shaderInfoLog;
			console.warn(m, shaderSource.getCompileSourceLineNumber(compileSource), m);

			ShaderManager.setCompileError(shaderName, shaderInfoLog as string);

			shaderSource.setCompileError(this.#glContext.getShaderInfoLog(shader) as string, includeCode);
			return false;
		}
		return true;
	}
}
