import { GL_ALPHA, GL_BYTE, GL_DRAW_FRAMEBUFFER, GL_FLOAT, GL_FLOAT_32_UNSIGNED_INT_24_8_REV, GL_FRAMEBUFFER, GL_HALF_FLOAT, GL_HALF_FLOAT_OES, GL_INT, GL_LUMINANCE, GL_LUMINANCE_ALPHA, GL_R8, GL_READ_FRAMEBUFFER, GL_RED, GL_RGB, GL_RGB32F, GL_RGBA, GL_RGBA16F, GL_RGBA32F, GL_RGBA32UI, GL_SHORT, GL_TEXTURE_2D, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, GL_TEXTURE_CUBE_MAP_POSITIVE_X, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, GL_UNSIGNED_BYTE, GL_UNSIGNED_INT, GL_UNSIGNED_INT_10F_11F_11F_REV, GL_UNSIGNED_INT_24_8, GL_UNSIGNED_INT_2_10_10_10_REV, GL_UNSIGNED_INT_5_9_9_9_REV, GL_UNSIGNED_SHORT, GL_UNSIGNED_SHORT_4_4_4_4, GL_UNSIGNED_SHORT_5_5_5_1, GL_UNSIGNED_SHORT_5_6_5 } from '../webgl/constants';

export enum TextureTarget {
	TEXTURE_2D = GL_TEXTURE_2D,
	TEXTURE_CUBE_MAP_POSITIVE_X = GL_TEXTURE_CUBE_MAP_POSITIVE_X,
	TEXTURE_CUBE_MAP_NEGATIVE_X = GL_TEXTURE_CUBE_MAP_NEGATIVE_X,
	TEXTURE_CUBE_MAP_POSITIVE_Y = GL_TEXTURE_CUBE_MAP_POSITIVE_Y,
	TEXTURE_CUBE_MAP_NEGATIVE_Y = GL_TEXTURE_CUBE_MAP_NEGATIVE_Y,
	TEXTURE_CUBE_MAP_POSITIVE_Z = GL_TEXTURE_CUBE_MAP_POSITIVE_Z,
	TEXTURE_CUBE_MAP_NEGATIVE_Z = GL_TEXTURE_CUBE_MAP_NEGATIVE_Z,
}

export enum TextureFormat {
	Rgb = GL_RGB,
	Rgba = GL_RGBA,
	Luminance = GL_LUMINANCE,
	LuminanceAlpha = GL_LUMINANCE_ALPHA,
	Alpha = GL_ALPHA,
	R8 = GL_R8,
	R8SignedNormalized = GL_R8,
	Rgba_32F = GL_RGBA32F,
	Rgb_32F = GL_RGB32F,
	Rgba_16F = GL_RGBA16F,
	Rgba_32UI = GL_RGBA32UI,
}

export enum TextureType {
	UnsignedByte = GL_UNSIGNED_BYTE,
	UnsignedShort_5_6_5 = GL_UNSIGNED_SHORT_5_6_5,
	UnsignedShort_4_4_4_4 = GL_UNSIGNED_SHORT_4_4_4_4,
	UnsignedShort_5_5_5_1 = GL_UNSIGNED_SHORT_5_5_5_1,
	UnsignedShort = GL_UNSIGNED_SHORT,
	UnsignedInt = GL_UNSIGNED_INT,
	UnsignedInt_24_8 = GL_UNSIGNED_INT_24_8,
	Float = GL_FLOAT,
	HalfFloatOes = GL_HALF_FLOAT_OES,
	HalfFloat = GL_HALF_FLOAT,
	Byte = GL_BYTE,
	Short = GL_SHORT,
	Int = GL_INT,
	UnsignedInt_2_10_10_10 = GL_UNSIGNED_INT_2_10_10_10_REV,
	UnsignedInt_10F_11F_11F = GL_UNSIGNED_INT_10F_11F_11F_REV,
	UnsignedInt_5_9_9_9 = GL_UNSIGNED_INT_5_9_9_9_REV,
	UnsignedFloat_32_UnsignedInt_24_8 = GL_FLOAT_32_UNSIGNED_INT_24_8_REV,
}

export enum FrameBufferTarget {
	FrameBuffer = GL_FRAMEBUFFER,
	DrawFrameBuffer = GL_DRAW_FRAMEBUFFER,
	ReadFrameBuffer = GL_READ_FRAMEBUFFER,
}

export enum ColorSpace {
	None = 0,
	Linear,
	Srgb,
	SrgbLinear,
}

export enum ToneMapping {
	None = 0,
	Linear,
	Reinhard,
	ReinhardExtended,
}

export enum TextureMapping {
	UvMapping = 0,
	CubeMapping,
	CubeUvMapping,//Cube mapped onto a 2D texture
}
