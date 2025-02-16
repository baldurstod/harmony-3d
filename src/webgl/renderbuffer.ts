import { GL_RENDERBUFFER } from './constants';
import { Graphics } from '../graphics/graphics';
import { DEBUG, ENABLE_GET_ERROR } from '../buildoptions';
import { RenderBufferInternalFormat } from '../textures/constants';
import { WebGLAnyRenderingContext } from '../types';

function renderbufferStorage(glContext: WebGLAnyRenderingContext, renderbuffer: WebGLRenderbuffer, internalFormat: RenderBufferInternalFormat, width: number, height: number) {
	if (ENABLE_GET_ERROR && DEBUG) {
		new Graphics().cleanupGLError();
	}
	glContext.bindRenderbuffer(GL_RENDERBUFFER, renderbuffer);
	if (ENABLE_GET_ERROR && DEBUG) {
		new Graphics().getGLError('bindRenderbuffer');
	}
	glContext.renderbufferStorage(GL_RENDERBUFFER, internalFormat, width, height);
	if (ENABLE_GET_ERROR && DEBUG) {
		new Graphics().getGLError('renderbufferStorage');
	}
	glContext.bindRenderbuffer(GL_RENDERBUFFER, null);
}

export class Renderbuffer {
	#renderbuffer: WebGLRenderbuffer;
	#internalFormat: RenderBufferInternalFormat;
	constructor(internalFormat: RenderBufferInternalFormat, width: number, height: number) {
		this.#renderbuffer = new Graphics().createRenderbuffer() as WebGLRenderbuffer;
		this.#internalFormat = internalFormat;
		renderbufferStorage(new Graphics().glContext, this.#renderbuffer, this.#internalFormat, width, height);
	}

	resize(width: number, height: number) {
		renderbufferStorage(new Graphics().glContext, this.#renderbuffer, this.#internalFormat, width, height);
	}

	getRenderbuffer() {
		return this.#renderbuffer;
	}

	dispose() {
		new Graphics().deleteRenderbuffer(this.#renderbuffer);
	}

}
