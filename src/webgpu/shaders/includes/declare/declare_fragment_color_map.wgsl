#ifdef USE_COLOR_MAP
		@group(0) @binding(x) var colorTexture: texture_2d<f32>;
		@group(0) @binding(x) var colorSampler: sampler;
#endif
#ifdef USE_COLOR_2_MAP
		@group(0) @binding(x) var color2Texture: texture_2d<f32>;
		@group(0) @binding(x) var color2Sampler: sampler;
#endif
