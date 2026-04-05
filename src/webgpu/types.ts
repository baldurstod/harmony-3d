import { WgslReflect } from 'wgsl_reflect';
import { Texture } from '../textures/texture';

export type WgslModule = {
	module: GPUShaderModule;
	reflection?: WgslReflect;
	attributes: Map<string, number>;
	source: string;
}

export type Binding = {
	buffer?: GPUBuffer,
	bufferType?: GPUBufferBindingType,
	texture?: Texture,
	textureCube?: Texture,
	textureArray?: (Texture | undefined)[],
	sampler?: GPUSampler,
	storageTexture?: Texture,
	storageTextureArray?: (Texture | undefined)[],
	access?: GPUStorageTextureAccess,
	visibility?: GPUShaderStageFlags,
	// for Textures
	viewDimension?: GPUTextureViewDimension,
	format?: GPUTextureFormat,
};
