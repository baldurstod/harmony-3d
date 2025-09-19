import { GL_VERTEX_SHADER, GL_FRAGMENT_SHADER } from './constants';
import { Uniform } from './uniform';
import { ShaderManager } from '../managers/shadermanager';
import { DEBUG, ENABLE_GET_ERROR } from '../buildoptions';
import { WebGLAnyRenderingContext } from '../types';
import { WebGLShaderSource } from './shadersource';

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
		this.#program = glContext.createProgram() as WebGLProgram;
		this.#vs = glContext.createShader(GL_VERTEX_SHADER) as WebGLShader;
		this.#fs = glContext.createShader(GL_FRAGMENT_SHADER) as WebGLShader;
		this.#vertexShaderName = vertexShaderName;
		this.#fragmentShaderName = fragmentShaderName;
		glContext.attachShader(this.#program, this.#vs);
		glContext.attachShader(this.#program, this.#fs);
	}

	get program() {
		throw 'error';
	}
	get vs() {
		throw 'error';
	}
	get fs() {
		throw 'error';
	}

	setUniformValue(name: string, value: any) {
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

	validate(includeCode: string) {//TODO: remove include code
		const vertexShaderScript = ShaderManager.getShaderSource(GL_VERTEX_SHADER, this.#vertexShaderName);
		const fragmentShaderScript = ShaderManager.getShaderSource(GL_FRAGMENT_SHADER, this.#fragmentShaderName);

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
	}

	invalidate() {
		this.#valid = false;
	}

	isValid(): boolean {
		return this.#valid;
	}

	getProgram(): WebGLProgram {
		return this.#program;
	}

	#initProgram() {
		this.attributes.clear();
		this.uniforms.clear();
		const activeAttributes = this.#glContext.getProgramParameter(this.#program, this.#glContext.ACTIVE_ATTRIBUTES);
		for (let i = 0; i < activeAttributes; i++) {
			const attribInfo = this.#glContext.getActiveAttrib(this.#program, i);
			if (attribInfo) {
				this.#setProgramAttribute(attribInfo.name);
			}
		}

		const activeUniforms = this.#glContext.getProgramParameter(this.#program, this.#glContext.ACTIVE_UNIFORMS);
		for (let i = 0; i < activeUniforms; i++) {
			const uniformInfo = this.#glContext.getActiveUniform(this.#program, i);
			if (uniformInfo) {
				this.#setProgramUniform(uniformInfo);
			}
		}

		let samplerId = 0;
		for (const [uniformName, uniform] of this.uniforms) {
			if (uniform.isTextureSampler()) {
				uniform.setTextureUnit(samplerId);//setValue(this.#glContext, samplerId);
				samplerId += uniform.getSize();
			}
		}
	}

	#setProgramAttribute(attributeName: string) {
		const attributeLocation = this.#glContext.getAttribLocation(this.#program, attributeName);
		this.attributes.set(attributeName, attributeLocation);//TODO: set in attributes ?
	}

	#setProgramUniform(uniformInfo: WebGLActiveInfo) {
		const uniformLocation = this.#glContext.getUniformLocation(this.#program, uniformInfo.name);
		if (uniformLocation) {
			this.uniforms.set(uniformInfo.name, new Uniform(uniformInfo, uniformLocation));
		}
	}

	#compileShader(shader: WebGLShader, shaderName: string, shaderSource: WebGLShaderSource, includeCode: string) {
		if (!shaderSource || !shaderSource.isValid()) {
			return null;
		}

		const compileSource = shaderSource.getCompileSource(includeCode);
		this.#glContext.shaderSource(shader, compileSource);
		this.#glContext.compileShader(shader);

		if (!this.#glContext.getShaderParameter(shader, this.#glContext.COMPILE_STATUS)) {
			const shaderInfoLog = this.#glContext.getShaderInfoLog(shader);
			const m = 'Compile error in ' + shaderName + '. Reason : ' + shaderInfoLog;
			console.warn(m, shaderSource.getCompileSourceLineNumber(includeCode), m);

			ShaderManager.setCompileError(shaderName, shaderInfoLog as string);

			shaderSource.setCompileError(this.#glContext.getShaderInfoLog(shader) as string, includeCode);
			return false;
		}
		return true;
	}
}
