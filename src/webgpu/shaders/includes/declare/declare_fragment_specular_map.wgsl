#ifdef USE_SPECULAR_MAP
	@group(0) @binding(x) var specularTexture: texture_2d<f32>;
	@group(0) @binding(x) var specularSampler: sampler;
#endif
