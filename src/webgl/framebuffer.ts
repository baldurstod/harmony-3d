import { GL_RENDERBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR, GL_TEXTURE_WRAP_S, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE } from './constants';
import { Graphics } from '../graphics/graphics';
import { TextureManager } from '../textures/texturemanager';
import { DEBUG, ENABLE_GET_ERROR } from '../buildoptions';
import { FrameBufferTarget } from '../textures/constants';
import { Renderbuffer } from './renderbuffer';
import { Texture } from '../textures/texture';

const ATTACHMENT_TYPE_RENDER_BUFFER = 0;
const ATTACHMENT_TYPE_TEXTURE2D = 1;
const ATTACHMENT_TYPE_TEXTURE_MULTIVIEW = 2;
const ATTACHMENT_TYPE_TEXTURE_LAYER = 3;

export class Framebuffer {
	#target: FrameBufferTarget;
	#frameBuffer: WebGLFramebuffer;
	#width = 1;
	#height = 1;
	#attachments = new Map<GLenum, any>();
	#dirty = true;
	constructor(target: FrameBufferTarget) {
		this.#target = target;
		this.#frameBuffer = new Graphics().createFramebuffer() as WebGLFramebuffer;
	}
	/*
	createRenderTarget(colorFormat, colorType, depth, stencil) {
		this.#frameBuffer.addTexture2D(GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, this._createTexture());
		this.frameBufferTexture = TextureManager.createTexture();

		this.bind();
	}

	_createTexture(internalFormat, width, height, format, type) {
		let texture = TextureManager.createTexture();

		new Graphics().glContext.bindTexture(GL_TEXTURE_2D, texture);
		new Graphics().glContext.texImage2D(GL_TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);
		new Graphics().glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
		new Graphics().glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
		new Graphics().glContext.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
		return texture;
	}
*/

	addRenderbuffer(attachmentPoint: number, renderbuffer: Renderbuffer) {
		this.#attachments.set(attachmentPoint, { renderbuffer: renderbuffer, type: ATTACHMENT_TYPE_RENDER_BUFFER });
		this.#dirty = true;
	}

	addTexture2D(attachmentPoint: number, textureTarget: GLenum, texture: Texture) {
		this.#attachments.set(attachmentPoint, { target: textureTarget, texture: texture, type: ATTACHMENT_TYPE_TEXTURE2D });
		this.#dirty = true;
	}

	#setupAttachments() {
		if (ENABLE_GET_ERROR && DEBUG) {
			new Graphics().cleanupGLError();
		}
		for (const [attachmentPoint, attachmentParams] of this.#attachments) {
			switch (attachmentParams.type) {
				case ATTACHMENT_TYPE_RENDER_BUFFER:
					//new Graphics().glContext.bindRenderbuffer(GL_RENDERBUFFER, attachmentParams.renderbuffer);
					//new Graphics().renderbufferStorage(GL_RENDERBUFFER, GL_RGBA4, 256, 256);
					new Graphics().glContext!.framebufferRenderbuffer(this.#target, attachmentPoint, GL_RENDERBUFFER, attachmentParams.renderbuffer.getRenderbuffer());
					if (ENABLE_GET_ERROR && DEBUG) {
						new Graphics().getGLError('framebufferRenderbuffer');
					}
					//new Graphics().bindRenderbuffer(GL_RENDERBUFFER, null);
					break;
				case ATTACHMENT_TYPE_TEXTURE2D:
					//console.error(new Graphics().getError());
					const webGLTexture = attachmentParams.texture.texture;
					new Graphics().glContext!.bindTexture(attachmentParams.target, null);
					new Graphics().glContext!.framebufferTexture2D(this.#target, attachmentPoint, attachmentParams.target, webGLTexture, 0);
					if (ENABLE_GET_ERROR && DEBUG) {
						new Graphics().getGLError('framebufferTexture2D');
					}
					break;
			}
		}
		this.#dirty = false;
		//console.error(new Graphics().checkFramebufferStatus(this.#target));
		//TODO: checkFramebufferStatus
	}

	bind() {
		if (ENABLE_GET_ERROR && DEBUG) {
			new Graphics().cleanupGLError();
		}
		new Graphics().glContext!.bindFramebuffer(this.#target, this.#frameBuffer);
		if (ENABLE_GET_ERROR && DEBUG) {
			new Graphics().getGLError('bindFramebuffer');
		}
		/*console.error(new Graphics().getError());
		this.#setupAttachments();//TODOv3
		console.error(new Graphics().getError());
		return;*/
		if (this.#dirty) {
			this.#setupAttachments();
		}
	}

	dispose() {
		new Graphics().deleteFramebuffer(this.#frameBuffer);
		for (const [attachmentPoint, attachment] of this.#attachments) {
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
