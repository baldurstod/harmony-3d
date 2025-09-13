import { DEBUG } from '../buildoptions';
import { CubeTexture } from '../textures/cubetexture';
import { Texture } from '../textures/texture';
import { WebGLAnyRenderingContext } from '../types';
import {
	GL_BOOL, GL_BOOL_VEC2, GL_BOOL_VEC3, GL_BOOL_VEC4, GL_FLOAT,
	GL_FLOAT_MAT2, GL_FLOAT_MAT3, GL_FLOAT_MAT4,
	GL_FLOAT_VEC2, GL_FLOAT_VEC3, GL_FLOAT_VEC4,
	GL_INT,
	GL_INT_SAMPLER_2D,
	GL_INT_SAMPLER_2D_ARRAY,
	GL_INT_SAMPLER_3D, GL_INT_SAMPLER_CUBE,
	GL_INT_VEC2, GL_INT_VEC3, GL_INT_VEC4, GL_SAMPLER_2D,
	GL_SAMPLER_2D_ARRAY,
	GL_SAMPLER_2D_ARRAY_SHADOW,
	GL_SAMPLER_2D_SHADOW,
	GL_SAMPLER_3D, GL_SAMPLER_CUBE,
	GL_SAMPLER_CUBE_SHADOW,
	GL_TEXTURE0, GL_TEXTURE_2D, GL_TEXTURE_CUBE_MAP,
	GL_UNSIGNED_INT_SAMPLER_2D,
	GL_UNSIGNED_INT_SAMPLER_2D_ARRAY,
	GL_UNSIGNED_INT_SAMPLER_3D, GL_UNSIGNED_INT_SAMPLER_CUBE
} from './constants';

function flattenArray(array: Float32List[], arrayCount: number, arraySize: number) {
	const out = new Float32Array(arrayCount * arraySize);//TODO: cache this
	let offset = 0;
	for (let i = 0; i < arrayCount; i++) {
		for (let j = 0; j < arraySize; j++) {
			out[offset] = array[i]![j]!;
			++offset;
		}
	}
	return out;
}

const SAMPLERS = new Set([
	GL_SAMPLER_2D, GL_SAMPLER_3D, GL_SAMPLER_CUBE, GL_SAMPLER_2D_ARRAY,
	GL_SAMPLER_2D_SHADOW, GL_SAMPLER_CUBE_SHADOW, GL_SAMPLER_2D_ARRAY_SHADOW,
	GL_INT_SAMPLER_2D, GL_INT_SAMPLER_3D, GL_INT_SAMPLER_CUBE, GL_INT_SAMPLER_2D_ARRAY,
	GL_UNSIGNED_INT_SAMPLER_2D, GL_UNSIGNED_INT_SAMPLER_3D, GL_UNSIGNED_INT_SAMPLER_CUBE, GL_UNSIGNED_INT_SAMPLER_2D_ARRAY]);

export class Uniform {
	#activeInfo: WebGLActiveInfo;
	#size: number
	#uniformLocation: WebGLUniformLocation;
	#isTextureSampler: boolean;
	#textureUnit?: number[] | number;
	setValue: (context: WebGLAnyRenderingContext, value: any) => void;
	constructor(activeInfo: WebGLActiveInfo, uniformLocation: WebGLUniformLocation) {
		this.#activeInfo = activeInfo;
		this.#size = activeInfo.size;
		this.#uniformLocation = uniformLocation;

		if (false && DEBUG && this.#size > 1) {
			console.error(this.#size);
		}

		this.setValue = this.#getSetter(activeInfo.type);
		this.#isTextureSampler = SAMPLERS.has(activeInfo.type);
	}

	#getSetter(type: GLenum) {
		const name = this.#activeInfo.name;
		if (name.endsWith('[0]')) {
			// Array
			switch (type) {
				case GL_BOOL:
				case GL_INT:
					return this.#uniform1iv;
				case GL_FLOAT:
					return this.#uniform1fv;
				case GL_FLOAT_VEC2:
					return this.#uniform2fv;
				case GL_FLOAT_VEC3:
					return this.#uniform3fv;
				case GL_FLOAT_VEC4:
					return this.#uniform4fv;
				case GL_SAMPLER_2D:
					return this.#uniformSampler2DArray;
				case GL_FLOAT_MAT4:
					return this.#uniformMatrix4fvArray;
				default:
					throw 'Unknown uniform array type : ' + type;
			}
		} else {
			// Scalar value
			switch (type) {
				case GL_BOOL:
				case GL_INT:
					return this.#uniform1i;
				case GL_FLOAT:
					return this.#uniform1f;
				case GL_BOOL_VEC2:
				case GL_INT_VEC2:
					return this.#uniform2iv;
				case GL_BOOL_VEC3:
				case GL_INT_VEC3:
					return this.#uniform3iv;
				case GL_BOOL_VEC4:
				case GL_INT_VEC4:
					return this.#uniform4iv;
				case GL_FLOAT_VEC2:
					return this.#uniform2fv;
				case GL_FLOAT_VEC3:
					return this.#uniform3fv;
				case GL_FLOAT_VEC4:
					return this.#uniform4fv;
				case GL_FLOAT_MAT2:
					return this.#uniformMatrix2fv;
				case GL_FLOAT_MAT3:
					return this.#uniformMatrix3fv;
				case GL_FLOAT_MAT4:
					return this.#uniformMatrix4fv;
				case GL_SAMPLER_2D:
					return this.#uniformSampler2D;
				case GL_SAMPLER_CUBE:
					return this.#uniformSamplerCube;
				default:
					throw 'Unknown uniform type : ' + type;
			}
		}
	}

	setTextureUnit(textureUnit: number) {
		if (this.#activeInfo.name.endsWith('[0]')) {
			this.#textureUnit = [];
			for (let i = 0; i < this.#size; ++i) {
				this.#textureUnit.push(textureUnit + i);
			}
		} else {
			this.#textureUnit = textureUnit;
		}
	}

	isTextureSampler(): boolean {
		return this.#isTextureSampler;
	}

	getSize() {
		return this.#size;
	}

	#uniform1i(glContext: WebGLAnyRenderingContext, value: number) {
		glContext.uniform1i(this.#uniformLocation, value);
	}

	#uniform1iv(glContext: WebGLAnyRenderingContext, value: Int32List) {
		glContext.uniform1iv(this.#uniformLocation, value);
	}

	#uniform2iv(glContext: WebGLAnyRenderingContext, value: Int32List) {
		glContext.uniform2iv(this.#uniformLocation, value);
	}

	#uniform3iv(glContext: WebGLAnyRenderingContext, value: Int32List) {
		glContext.uniform3iv(this.#uniformLocation, value);
	}

	#uniform4iv(glContext: WebGLAnyRenderingContext, value: Int32List) {
		glContext.uniform4iv(this.#uniformLocation, value);
	}

	#uniform1f(glContext: WebGLAnyRenderingContext, value: GLfloat) {
		glContext.uniform1f(this.#uniformLocation, value);
	}

	#uniform1fv(glContext: WebGLAnyRenderingContext, value: Float32List) {
		glContext.uniform1fv(this.#uniformLocation, value);
	}

	#uniform2fv(glContext: WebGLAnyRenderingContext, value: Float32List) {
		glContext.uniform2fv(this.#uniformLocation, value);
	}

	#uniform3fv(glContext: WebGLAnyRenderingContext, value: Float32List) {
		glContext.uniform3fv(this.#uniformLocation, value);
	}

	#uniform4fv(glContext: WebGLAnyRenderingContext, value: Float32List) {
		glContext.uniform4fv(this.#uniformLocation, value);
	}

	#uniformMatrix2fv(glContext: WebGLAnyRenderingContext, value: Float32List) {
		glContext.uniformMatrix2fv(this.#uniformLocation, false, value);
	}

	#uniformMatrix3fv(glContext: WebGLAnyRenderingContext, value: Float32List) {
		glContext.uniformMatrix3fv(this.#uniformLocation, false, value);
	}

	#uniformMatrix4fv(glContext: WebGLAnyRenderingContext, value: Float32List) {
		glContext.uniformMatrix4fv(this.#uniformLocation, false, value);
	}

	#uniformMatrix4fvArray(glContext: WebGLAnyRenderingContext, value: Float32List[]) {
		glContext.uniformMatrix4fv(this.#uniformLocation, false, flattenArray(value, this.#size, 16));
	}

	#uniformSampler2D(glContext: WebGLAnyRenderingContext, texture: Texture) {
		glContext.uniform1i(this.#uniformLocation, (this.#textureUnit as number));
		glContext.activeTexture(GL_TEXTURE0 + (this.#textureUnit as number));
		if (texture) {
			glContext.bindTexture(GL_TEXTURE_2D, texture.texture);
		} else {
			glContext.bindTexture(GL_TEXTURE_2D, null);
		}
	}

	#uniformSampler2DArray(glContext: WebGLAnyRenderingContext, textures: Texture[]) {
		glContext.uniform1iv(this.#uniformLocation, (this.#textureUnit as number[]));

		for (let i = 0; i < this.#size; ++i) {
			const texture = textures[i];
			glContext.activeTexture(GL_TEXTURE0 + (this.#textureUnit as number[])[i]!);
			if (texture) {
				glContext.bindTexture(GL_TEXTURE_2D, texture.texture);
			} else {
				glContext.bindTexture(GL_TEXTURE_2D, null);
			}
		}
	}

	#uniformSamplerCube(glContext: WebGLAnyRenderingContext, texture: CubeTexture) {
		glContext.uniform1i(this.#uniformLocation, (this.#textureUnit as number));
		glContext.activeTexture(GL_TEXTURE0 + (this.#textureUnit as number));
		if (texture) {
			glContext.bindTexture(GL_TEXTURE_CUBE_MAP, texture.texture);
		} else {
			glContext.bindTexture(GL_TEXTURE_CUBE_MAP, null);
		}
	}
}
