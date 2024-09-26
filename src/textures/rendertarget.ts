import { vec4 } from 'gl-matrix';

import { GL_FRAMEBUFFER, GL_LINEAR, GL_CLAMP_TO_EDGE, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, GL_DEPTH_COMPONENT16, GL_DEPTH_ATTACHMENT } from '../webgl/constants';
import { TextureManager } from './texturemanager';
import { Graphics } from '../graphics/graphics';
import { Framebuffer } from '../webgl/framebuffer';
import { Renderbuffer } from '../webgl/renderbuffer';
import { FrameBufferTarget, TextureFormat, TextureType } from './constants';
import { AnyTexture } from '../types';

export class RenderTarget {
	#width: number;
	#height: number;
	#target: FrameBufferTarget = GL_FRAMEBUFFER;
	#frameBuffer = new Framebuffer(this.#target);
	#depthRenderbuffer: Renderbuffer;
	#texture: AnyTexture;
	#scissor = vec4.create();
	#viewport = vec4.create();
	#scissorTest = false;
	#depthBuffer: boolean;
	#stencilBuffer: boolean;
	#depthTexture: boolean;
	constructor(params: any = {}/*width, height, options = {}/*depth, stencil, texture*/) {
		const width = params.width ?? 1;
		const height = params.height ?? 1;

		if (params.texture) {
			this.#texture = params.texture;
		} else {
			this.#texture = TextureManager.createTexture({ internalFormat: params.internalFormat, format: params.format, type: params.type }/*{minFilter:GL_LINEAR, wrapS:GL_CLAMP_TO_EDGE, wrapT:GL_CLAMP_TO_EDGE}*/);
			this.#texture.addUser(this);
		}
		this.#texture.minFilter = GL_LINEAR;
		this.#texture.wrapS = GL_CLAMP_TO_EDGE;
		this.#texture.wrapT = GL_CLAMP_TO_EDGE;
		this.#texture.setParameters(Graphics.glContext, GL_TEXTURE_2D);//TODOv3: remove

		vec4.set(this.#scissor, 0, 0, width, height);
		vec4.set(this.#viewport, 0, 0, width, height);

		this.#depthBuffer = params.depthBuffer ?? true;
		this.#stencilBuffer = params.stencilBuffer ?? false;
		this.#depthTexture = params.depthTexture ?? false;

		this.#create(width, height);
	}

	#create(width: number, height: number) {
		this.#frameBuffer.addTexture2D(GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, this.#texture);
		this.#createDepthBuffer(width, height);
		if (this.#stencilBuffer) {///TODOv3

		}
		this.resize(width, height)
	}

	#createDepthBuffer(width: number, height: number) {
		if (this.#depthBuffer && !this.#depthRenderbuffer) {//TODOv3 DEPTH_STENCIL
			this.#depthRenderbuffer = new Renderbuffer(GL_DEPTH_COMPONENT16, width, height);
			this.#frameBuffer.addRenderbuffer(GL_DEPTH_ATTACHMENT, this.#depthRenderbuffer);
		}
	}

	setDepthBuffer(depthBuffer: boolean) {
		this.#depthBuffer = depthBuffer;
		this.#createDepthBuffer(this.#width, this.#height);
	}

	setScissorTest(scissorTest: boolean) {
		this.#scissorTest = scissorTest;
	}

	getWidth() {
		return this.#width;
	}

	getHeight() {
		return this.#height;
	}

	getTexture() {
		return this.#texture;
	}

	get texture() {
		throw 'deprecated, use getTexture()';
	}

	bind() {
		this.#frameBuffer.bind();
		Graphics.viewport = this.#viewport;
	}

	unbind() {
		Graphics.glContext.bindFramebuffer(GL_FRAMEBUFFER, null);
	}

	resize(width: number, height: number) {
		this.#width = width;
		this.#height = height;
		this.#texture.texImage2D(Graphics.glContext, GL_TEXTURE_2D, width, height, TextureFormat.Rgba, TextureType.UnsignedByte);
		//TODOv3: stencil / depth buffer
		if (this.#depthRenderbuffer) {
			this.#depthRenderbuffer.resize(width, height);
		}
		this.setViewport(0, 0, width, height);
	}

	setViewport(x: number, y: number, width: number, height: number) {
		vec4.set(this.#viewport, x, y, width, height);
		vec4.set(this.#scissor, x, y, width, height);
	}

	clone() {
		let dest = new RenderTarget({ width: this.#width, height: this.#height, depthBuffer: this.#depthBuffer, stencilBuffer: this.#stencilBuffer });

		//dest.texture = this.#texture.clone();

		return dest;
	}

	dispose() {
		this.#texture.removeUser(this);
		this.#frameBuffer.dispose();
	}
}
