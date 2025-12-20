import { Color } from '../core/color';
import { Graphics } from '../graphics/graphics2';
import { WebGPUInternal } from '../graphics/webgpuinternal';
import { createTexture, deleteTexture, fillCheckerTexture, fillFlatTexture, fillNoiseTexture, fillTextureWithImage, HarmonyGPUTextureDescriptor, HarmonyGPUTextureDescriptorOptionalSize } from '../textures/texturefactory';
import { Texture, TextureParams } from './texture';

export type CreateTextureParams = TextureParams & {
	webgpuDescriptor: HarmonyGPUTextureDescriptor;
	needCubeMap?: boolean;
};

export type CreateFlatTextureParams = CreateTextureParams & {
	webgpuDescriptor: HarmonyGPUTextureDescriptor;
	color?: Color;
};

export type CreateCheckerTextureParams = {
	width?: number,
	height?: number,
	color?: Color;
	needCubeMap?: boolean;
};

export type CreateNoiseTextureParams = TextureParams & {
	webgpuDescriptor: HarmonyGPUTextureDescriptor;
	needCubeMap?: boolean;
	//width: number; // TODO: fix, redundant with webgpuDescriptor.size
	//height: number;// TODO: fix, redundant with webgpuDescriptor.size
};

export type CreateImageTextureParams = TextureParams & {
	webgpuDescriptor: HarmonyGPUTextureDescriptorOptionalSize;
	image: HTMLImageElement;
};

export class TextureManager {
	static #texturesList = new Map<string, Texture>();

	static setTexture(path: string, texture: Texture) {
		this.#texturesList.set(path, texture);
	}

	static createTexture(textureParams: CreateTextureParams) {
		const texture = new Texture(textureParams);
		texture.texture = createTexture(textureParams.webgpuDescriptor /*?? {
			size: [1],
			format: 'rgba8unorm',
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
		}*/);
		if (Graphics.isWebGPU) {
			texture.sampler = WebGPUInternal.device.createSampler();
		}
		//TODOv3: init texture parameters
		//texture.setParameters(Graphics.glContext, target);
		return texture;
	}

	static deleteTexture(texture: Texture) {
		deleteTexture(texture.texture);
	}

	static createFlatTexture(textureParams: CreateFlatTextureParams/*, color: Color = new Color(1, 0, 1), needCubeMap = false*/) {
		const texture = this.createTexture(textureParams);
		fillFlatTexture(texture, textureParams.color ?? new Color(1, 0, 1), textureParams.needCubeMap ?? false);
		return texture;
	}

	static createCheckerTexture(textureParams: CreateCheckerTextureParams = {}/*, color: Color = new Color(1, 0, 1), width = 64, height = 64, needCubeMap = false*/) {
		const width = textureParams.width ?? 64;
		const height = textureParams.height ?? 64;
		const descriptor: HarmonyGPUTextureDescriptor = {
			size: { width, height, depthOrArrayLayers: textureParams.needCubeMap ? 6 : 1 },
			format: 'rgba8unorm',
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
		}
		const texture = this.createTexture({ webgpuDescriptor: descriptor });
		fillCheckerTexture(texture, textureParams.color ?? new Color(1, 0, 1), width, height, textureParams.needCubeMap ?? false);
		return texture;
	}

	static createNoiseTexture(textureParams: CreateNoiseTextureParams/*, width: number, height: number, needCubeMap = false*/) {
		const texture = this.createTexture(textureParams);
		fillNoiseTexture(texture, textureParams.webgpuDescriptor.size.width, textureParams.webgpuDescriptor.size.height, textureParams.needCubeMap);
		return texture;
	}

	static createTextureFromImage(textureParams: CreateImageTextureParams) {
		textureParams.webgpuDescriptor.size = { width: textureParams.image.naturalWidth, height: textureParams.image.naturalHeight }//[image.naturalWidth, image.naturalHeight, 1];
		const texture = this.createTexture(textureParams as CreateTextureParams);
		fillTextureWithImage(texture, textureParams.image);
		return texture;
	}

	static fillTextureWithImage(texture: Texture, image: HTMLImageElement) {
		return fillTextureWithImage(texture, image);
	}
}
