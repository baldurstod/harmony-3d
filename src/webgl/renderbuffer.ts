import { DEBUG, ENABLE_GET_ERROR } from '../buildoptions';
import { Graphics } from '../graphics/graphics2';
import { RenderBufferInternalFormat } from '../textures/constants';
import { WebGLAnyRenderingContext } from '../types';
import { GL_RENDERBUFFER } from './constants';

function renderbufferStorage(renderbuffer: WebGLRenderbuffer, internalFormat: RenderBufferInternalFormat, width: number, height: number, samples: GLsizei): void {
	const glContext: WebGLAnyRenderingContext = Graphics.glContext;
	if (ENABLE_GET_ERROR && DEBUG) {
		Graphics.cleanupGLError();
	}
	glContext.bindRenderbuffer(GL_RENDERBUFFER, renderbuffer);
	if (ENABLE_GET_ERROR && DEBUG) {
		Graphics.getGLError('bindRenderbuffer');
	}

	if (Graphics.isWebGL2 && samples > 0) {
		(glContext as WebGL2RenderingContext).renderbufferStorageMultisample(GL_RENDERBUFFER, samples, internalFormat, width, height);
		if (ENABLE_GET_ERROR && DEBUG) {
			Graphics.getGLError('renderbufferStorageMultisample');
		}
	} else {
		glContext.renderbufferStorage(GL_RENDERBUFFER, internalFormat, width, height);
		if (ENABLE_GET_ERROR && DEBUG) {
			Graphics.getGLError('renderbufferStorage');
		}
	}

	glContext.bindRenderbuffer(GL_RENDERBUFFER, null);
}

export class Renderbuffer {
	#renderbuffer: WebGLRenderbuffer;
	#internalFormat: RenderBufferInternalFormat;
	#samples?: GLsizei;

	constructor(internalFormat: RenderBufferInternalFormat, width: number, height: number, samples?: GLsizei) {
		this.#renderbuffer = Graphics.createRenderbuffer();
		this.#internalFormat = internalFormat;
		this.#samples = samples;
		renderbufferStorage(this.#renderbuffer, this.#internalFormat, width, height, this.#samples ?? 0);
	}

	resize(width: number, height: number): void {
		renderbufferStorage(this.#renderbuffer, this.#internalFormat, width, height, this.#samples ?? 0);
	}

	getRenderbuffer(): WebGLRenderbuffer {
		return this.#renderbuffer;
	}

	dispose(): void {
		Graphics.deleteRenderbuffer(this.#renderbuffer);
	}

}
