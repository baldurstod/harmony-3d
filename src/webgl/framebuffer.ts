import { GL_RENDERBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR, GL_TEXTURE_WRAP_S, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE } from './constants';
import { Graphics } from '../graphics/graphics';
import { TextureManager } from '../textures/texturemanager';
import { DEBUG, ENABLE_GET_ERROR } from '../buildoptions';
import { FrameBufferTarget } from '../textures/constants';

const ATTACHMENT_TYPE_RENDER_BUFFER = 0;
const ATTACHMENT_TYPE_TEXTURE2D = 1;
const ATTACHMENT_TYPE_TEXTURE_MULTIVIEW = 2;
const ATTACHMENT_TYPE_TEXTURE_LAYER = 3;

export class Framebuffer {
	#target: FrameBufferTarget;
	#frameBuffer: WebGLFramebuffer;
	#width: number = 1;
	#height: number = 1;
	#attachments: Map<GLenum, any> = new Map();
	#dirty: boolean = true;
	constructor(target: FrameBufferTarget) {
		this.#target = target;
		this.#frameBuffer = Graphics.createFramebuffer();
	}
/*
	createRenderTarget(colorFormat, colorType, depth, stencil) {
		this.#frameBuffer.addTexture2D(GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, this._createTexture());
		this.frameBufferTexture = TextureManager.createTexture();

		this.bind();
	}

	_createTexture(internalFormat, width, height, format, type) {
		let texture = TextureManager.createTexture();

		Graphics.glContext.bindTexture(GL_TEXTURE_2D, texture);
		Graphics.glContext.texImage2D(GL_TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);
		Graphics.glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		Graphics.glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
		Graphics.glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
		return texture;
	}
*/

	addRenderbuffer(attachmentPoint, renderbuffer) {
		this.#attachments.set(attachmentPoint, { renderbuffer: renderbuffer, type: ATTACHMENT_TYPE_RENDER_BUFFER });
		this.#dirty = true;
	}

	addTexture2D(attachmentPoint, textureTarget, texture) {
		this.#attachments.set(attachmentPoint, { target: textureTarget, texture: texture, type: ATTACHMENT_TYPE_TEXTURE2D });
		this.#dirty = true;
	}

	_setupAttachments() {
		if (ENABLE_GET_ERROR && DEBUG) {
			Graphics.cleanupGLError();
		}
		for (let [attachmentPoint, attachmentParams] of this.#attachments) {
			switch (attachmentParams.type) {
				case ATTACHMENT_TYPE_RENDER_BUFFER:
					//Graphics.glContext.bindRenderbuffer(GL_RENDERBUFFER, attachmentParams.renderbuffer);
					//Graphics.renderbufferStorage(GL_RENDERBUFFER, GL_RGBA4, 256, 256);
					Graphics.glContext.framebufferRenderbuffer(this.#target, attachmentPoint, GL_RENDERBUFFER, attachmentParams.renderbuffer.renderbuffer);
					if (ENABLE_GET_ERROR && DEBUG) {
						Graphics.getGLError('framebufferRenderbuffer');
					}
					//Graphics.bindRenderbuffer(GL_RENDERBUFFER, null);
					break;
				case ATTACHMENT_TYPE_TEXTURE2D:
					//console.error(Graphics.getError());
					let webGLTexture = attachmentParams.texture.texture;
					Graphics.glContext.bindTexture(attachmentParams.target, null);
					Graphics.glContext.framebufferTexture2D(this.#target, attachmentPoint, attachmentParams.target, webGLTexture, 0);
					if (ENABLE_GET_ERROR && DEBUG) {
						Graphics.getGLError('framebufferTexture2D');
					}
					break;
			}
		}
		this.#dirty = false;
		//console.error(Graphics.checkFramebufferStatus(this.#target));
		//TODO: checkFramebufferStatus
	}

	bind() {
		if (ENABLE_GET_ERROR && DEBUG) {
			Graphics.cleanupGLError();
		}
		Graphics.glContext.bindFramebuffer(this.#target, this.#frameBuffer);
		if (ENABLE_GET_ERROR && DEBUG) {
			Graphics.getGLError('bindFramebuffer');
		}
		/*console.error(Graphics.getError());
		this._setupAttachments();//TODOv3
		console.error(Graphics.getError());
		return;*/
		if (this.#dirty) {
			this._setupAttachments();
		}
	}

	dispose() {
		Graphics.deleteFramebuffer(this.#frameBuffer);
		for (let [attachmentPoint, attachment] of this.#attachments) {
			switch (attachment.type) {
				case ATTACHMENT_TYPE_RENDER_BUFFER:
					attachment.renderbuffer.dispose();
					break;
				case ATTACHMENT_TYPE_TEXTURE2D:
					attachment.texture.removeUser(this);
					break;
			}
		}
	}
	//void gl.framebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer);
	//void gl.framebufferTexture2D(target, attachment, textarget, texture, level);
	//void ext.framebufferTextureMultiviewOVR(target, attachment, texture, level, baseViewIndex, numViews);
	//void gl.framebufferTextureLayer(target, attachment, texture, level, layer);
}
