import { GL_RENDERBUFFER } from './constants';
import { Graphics } from '../graphics/graphics';
import { DEBUG, ENABLE_GET_ERROR } from '../buildoptions';
import { RenderBufferInternalFormat } from '../textures/constants';

function renderbufferStorage(glContext, renderbuffer, internalFormat, width, height) {
	if (ENABLE_GET_ERROR && DEBUG) {
		Graphics.cleanupGLError();
	}
	glContext.bindRenderbuffer(GL_RENDERBUFFER, renderbuffer);
	if (ENABLE_GET_ERROR && DEBUG) {
		Graphics.getGLError('bindRenderbuffer');
	}
	glContext.renderbufferStorage(GL_RENDERBUFFER, internalFormat, width, height);
	if (ENABLE_GET_ERROR && DEBUG) {
		Graphics.getGLError('renderbufferStorage');
	}
	glContext.bindRenderbuffer(GL_RENDERBUFFER, null);
}

export class Renderbuffer {
	#renderbuffer: WebGLRenderbuffer;
	#internalFormat: RenderBufferInternalFormat;
	constructor(internalFormat: RenderBufferInternalFormat, width: number, height: number) {
		this.#renderbuffer = Graphics.createRenderbuffer();
		this.#internalFormat = internalFormat;
		//this._renderbufferStorage(width, height);
		renderbufferStorage(Graphics.glContext, this.#renderbuffer, this.#internalFormat, width, height);
	}

	resize(width: number, height: number) {
		//this._renderbufferStorage(width, height);
		renderbufferStorage(Graphics.glContext, this.#renderbuffer, this.#internalFormat, width, height);
	}

	getRenderbuffer() {
		return this.#renderbuffer;
	}

	/*TODOv3 removeme
		_renderbufferStorage(width, height) {
			glContext.bindRenderbuffer(GL_RENDERBUFFER, this.renderbuffer);
			glContext.renderbufferStorage(GL_RENDERBUFFER, this.internalFormat, width, height);
			glContext.bindRenderbuffer(GL_RENDERBUFFER, null);
		}*/

	dispose() {
		Graphics.deleteRenderbuffer(this.#renderbuffer);
	}

}
