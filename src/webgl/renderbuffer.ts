import { GL_RENDERBUFFER } from './constants';
import { getGraphics, Graphics } from '../graphics/graphics';
import { DEBUG, ENABLE_GET_ERROR } from '../buildoptions';
import { RenderBufferInternalFormat } from '../textures/constants';
import { WebGLAnyRenderingContext } from '../types';

const graphics = getGraphics();

function renderbufferStorage(renderbuffer: WebGLRenderbuffer, internalFormat: RenderBufferInternalFormat, width: number, height: number, samples: number) {
	const glContext: WebGLAnyRenderingContext = graphics.glContext;
	if (ENABLE_GET_ERROR && DEBUG) {
		graphics.cleanupGLError();
	}
	glContext.bindRenderbuffer(GL_RENDERBUFFER, renderbuffer);
	if (ENABLE_GET_ERROR && DEBUG) {
		graphics.getGLError('bindRenderbuffer');
	}

	if (graphics.isWebGL2 && samples > 0) {
		(glContext as WebGL2RenderingContext).renderbufferStorageMultisample(GL_RENDERBUFFER, samples, internalFormat, width, height);
		if (ENABLE_GET_ERROR && DEBUG) {
			graphics.getGLError('renderbufferStorageMultisample');
		}
	} else {
		glContext.renderbufferStorage(GL_RENDERBUFFER, internalFormat, width, height);
		if (ENABLE_GET_ERROR && DEBUG) {
			graphics.getGLError('renderbufferStorage');
		}
	}

	glContext.bindRenderbuffer(GL_RENDERBUFFER, null);
}

export class Renderbuffer {
	#renderbuffer: WebGLRenderbuffer;
	#internalFormat: RenderBufferInternalFormat;
	#samples?: number;

	constructor(internalFormat: RenderBufferInternalFormat, width: number, height: number, samples?: number) {
		this.#renderbuffer = graphics.createRenderbuffer() as WebGLRenderbuffer;
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
		graphics.deleteRenderbuffer(this.#renderbuffer);
	}

}
