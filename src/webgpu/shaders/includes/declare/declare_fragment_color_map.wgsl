#ifdef USE_COLOR_MAP
		@group(0) @binding(x) var colorTexture: texture_2d<f32>;
		@group(0) @binding(x) var colorSampler: sampler;
#endif
#ifdef USE_COLOR_1_MAP
		@group(0) @binding(x) var color1Texture: texture_2d<f32>;
		@group(0) @binding(x) var color1Sampler: sampler;
#endif
