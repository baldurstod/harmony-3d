#if defined(USE_DETAIL1_MAP) || defined(USE_DETAIL2_MAP)
	struct DetailTextures {
		#ifdef USE_DETAIL1_MAP
			g_vDetailTexCoordScale: vec4f,
			g_vDetailTexCoordOffset: vec4f,
			g_vDetail1ColorTint: vec4f,
		#endif
		#ifdef USE_DETAIL2_MAP
			g_vDetail2TexCoordScale: vec4f,
			g_vDetail2TexCoordOffset: vec4f,
			g_vDetail2ColorTint: vec4f,
		#endif
	}

	@group(0) @binding(x) var<uniform> detailTextures: DetailTextures;
#endif

#ifdef USE_DETAIL1_MAP
	@group(0) @binding(x) var detail1Texture: texture_2d<f32>;
	@group(0) @binding(x) var detail1Sampler: sampler;
#endif
#ifdef USE_DETAIL2_MAP
	@group(0) @binding(x) var detail2Texture: texture_2d<f32>;
	@group(0) @binding(x) var detail2Sampler: sampler;
#endif
