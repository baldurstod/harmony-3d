
#ifdef USE_TEXTURE_TRANSFORM
	@group(0) @binding(x) var<uniform> uTextureTransform: mat4x4f;
#endif
#ifdef USE_TEXTURE2_TRANSFORM
	@group(0) @binding(x) var<uniform> uTexture2Transform: mat4x4f;
#endif
