import { DEBUG, ENABLE_GET_ERROR } from '../buildoptions';
import { Graphics } from '../graphics/graphics';
import { RenderBufferInternalFormat } from '../textures/constants';
import { WebGLAnyRenderingContext } from '../types';
import { GL_RENDERBUFFER } from './constants';

function renderbufferStorage(renderbuffer: WebGLRenderbuffer, internalFormat: RenderBufferInternalFormat, width: number, height: number, samples: number) {
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
	#samples?: number;

	constructor(internalFormat: RenderBufferInternalFormat, width: number, height: number, samples?: number) {
		this.#renderbuffer = Graphics.createRenderbuffer() as WebGLRenderbuffer;
		this.#internalFormat = internalFormat;
		renderbufferStorage(this.#renderbuffer, this.#internalFormat, width, height, this.#samples ?? 0);
	}

	resize(width: number, height: number) {
		renderbufferStorage(this.#renderbuffer, this.#internalFormat, width, height, this.#samples ?? 0);
	}

	getRenderbuffer() {
		return this.#renderbuffer;
	}

	dispose() {
		Graphics.deleteRenderbuffer(this.#renderbuffer);
	}

}
