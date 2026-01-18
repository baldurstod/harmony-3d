import { vec4 } from 'gl-matrix';
import { Graphics } from '../graphics/graphics2';
import { AnyTexture } from '../types';
import { GL_CLAMP_TO_EDGE, GL_COLOR_ATTACHMENT0, GL_DEPTH_ATTACHMENT, GL_DEPTH_COMPONENT16, GL_FRAMEBUFFER, GL_LINEAR, GL_TEXTURE_2D } from '../webgl/constants';
import { Framebuffer } from '../webgl/framebuffer';
import { Renderbuffer } from '../webgl/renderbuffer';
import { FrameBufferTarget, TextureFormat, TextureType } from './constants';
import { createTexture } from './texturefactory';
import { TextureManager } from './texturemanager';

export type CreateRenderTargetParams = {
	texture?: AnyTexture,
	webgpuFormat?: GPUTextureFormat,
	width?: number;
	height?: number;
	internalFormat?: any;
	format?: any;
	type?: any;
	depthBuffer?: boolean;
	stencilBuffer?: boolean;
	depthTexture?: boolean;
};

export class RenderTarget {
	#width = 0;
	#height = 0;
	#target: FrameBufferTarget = GL_FRAMEBUFFER;
	readonly #frameBuffer = new Framebuffer(this.#target);
	#depthRenderbuffer?: Renderbuffer;
	#texture: AnyTexture;
	readonly #scissor = vec4.create();
	readonly #viewport = vec4.create();
	#scissorTest = false;
	#depthBuffer: boolean;
	#stencilBuffer: boolean;
	#depthTexture: boolean;

	constructor(params: CreateRenderTargetParams = {}/*width, height, options = {}/*depth, stencil, texture*/) {
		const width = params.width ?? 1;
		const height = params.height ?? 1;

		if (params.texture) {
			this.#texture = params.texture;
		} else {
			this.#texture = TextureManager.createTexture({
				webgpuDescriptor: {
					//format: 'rgba8unorm',//WebGPUInternal.format,
					format: 'rgba8unorm',//WebGPUInternal.format,
					usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
					size: { width, height },
				},
				internalFormat: params.internalFormat,
				format: params.format,
				type: params.type
			}/*{minFilter:GL_LINEAR, wrapS:GL_CLAMP_TO_EDGE, wrapT:GL_CLAMP_TO_EDGE}*/);
		}
		this.#texture.addUser(this);
		this.#texture.minFilter = GL_LINEAR;
		this.#texture.wrapS = GL_CLAMP_TO_EDGE;
		this.#texture.wrapT = GL_CLAMP_TO_EDGE;
		this.#texture.setParameters(Graphics.glContext, GL_TEXTURE_2D);//TODOv3: remove

		this.setViewport(0, 0, width, height);

		this.#depthBuffer = params.depthBuffer ?? true;
		this.#stencilBuffer = params.stencilBuffer ?? false;
		this.#depthTexture = params.depthTexture ?? false;

		this.#create(width, height);
	}

	#create(width: number, height: number): void {
		this.#frameBuffer.addTexture2D(GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, this.#texture);
		this.#createDepthBuffer(width, height);
		if (this.#stencilBuffer) {///TODOv3

		}
		this.resize(width, height)
	}

	#createDepthBuffer(width: number, height: number): void {
		if (this.#depthBuffer && !this.#depthRenderbuffer) {//TODOv3 DEPTH_STENCIL
			this.#depthRenderbuffer = new Renderbuffer(GL_DEPTH_COMPONENT16, width, height);
			this.#frameBuffer.addRenderbuffer(GL_DEPTH_ATTACHMENT, this.#depthRenderbuffer);
		}
	}

	setDepthBuffer(depthBuffer: boolean): void {
		this.#depthBuffer = depthBuffer;
		this.#createDepthBuffer(this.#width, this.#height);
	}

	setScissorTest(scissorTest: boolean): void {
		this.#scissorTest = scissorTest;
	}

	getWidth(): number {
		return this.#width;
	}

	getHeight(): number {
		return this.#height;
	}

	getTexture(): AnyTexture {
		return this.#texture;
	}

	/**
	 * @deprecated Please use `getTexture` instead.
	 */
	get texture(): void {
		throw new Error('deprecated, use getTexture()');
	}

	bind(): void {
		this.#frameBuffer.bind();
		Graphics.setViewport(this.#viewport);
	}

	unbind(): void {
		Graphics.glContext.bindFramebuffer(GL_FRAMEBUFFER, null);
	}

	resize(width: number, height: number): void {
		if (Graphics.isWebGLAny) {
			this.#texture.texImage2D(Graphics.glContext, GL_TEXTURE_2D, width, height, TextureFormat.Rgba, TextureType.UnsignedByte);
		} else {
			if (this.#width != width || this.#height != height) {
				(this.#texture.texture as GPUTexture | null)?.destroy();
				this.#texture.texture = createTexture({
					// TODO: mutualize descriptor
					format: this.#texture.gpuFormat,
					usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
					size: { width, height },
				});
			}
		}

		this.#width = width;
		this.#height = height;
		//TODOv3: stencil / depth buffer
		if (this.#depthRenderbuffer) {
			this.#depthRenderbuffer.resize(width, height);
		}
		this.setViewport(0, 0, width, height);
	}

	setViewport(x: number, y: number, width: number, height: number): void {
		vec4.set(this.#viewport, x, y, width, height);
		vec4.set(this.#scissor, x, y, width, height);
	}

	clone(): RenderTarget {
		const dest = new RenderTarget({ width: this.#width, height: this.#height, depthBuffer: this.#depthBuffer, stencilBuffer: this.#stencilBuffer });

		//dest.texture = this.#texture.clone();

		return dest;
	}

	dispose(): void {
		this.#texture.removeUser(this);
		this.#frameBuffer.dispose();
	}
}
