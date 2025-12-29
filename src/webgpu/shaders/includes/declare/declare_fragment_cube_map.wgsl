#ifdef USE_CUBE_MAP
	@group(0) @binding(x) var cubeTexture: texture_cube<f32>;
	@group(0) @binding(x) var cubeSampler: sampler;
#endif
