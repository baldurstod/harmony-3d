#ifdef USE_COLOR_MAP
		@group(1) @binding(1) var colorTexture: texture_2d<f32>;
		@group(1) @binding(2) var colorSampler: sampler;
#endif
#ifdef USE_COLOR_1_MAP
		@group(1) @binding(3) var color1Texture: texture_2d<f32>;
		@group(1) @binding(4) var color1Sampler: sampler;
#endif
