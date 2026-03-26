#ifdef USE_MASK_MAP
	@group(0) @binding(x) var maskTexture: texture_2d<f32>;
	@group(0) @binding(x) var maskSampler: sampler;
#endif
#ifdef USE_MASK1_MAP
	@group(0) @binding(x) var mask1Texture: texture_2d<f32>;
	@group(0) @binding(x) var mask1Sampler: sampler;
#endif
#ifdef USE_MASK2_MAP
	@group(0) @binding(x) var mask2Texture: texture_2d<f32>;
	@group(0) @binding(x) var mask2Sampler: sampler;
#endif
