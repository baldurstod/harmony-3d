#ifdef USE_SELF_ILLUM
	@group(0) @binding(x) var<uniform> uSelfIllumTint: vec3f;

	#ifdef USE_SELF_ILLUM_MASK_MAP
		@group(0) @binding(x) var uSelfIllumMaskTexture: texture_2d<f32>;
		@group(0) @binding(x) var uSelfIllumMaskSampler: sampler;
	#endif

	#ifndef SKIP_SELF_ILLUM_FRESNEL
		#ifdef USE_SELF_ILLUM_FRESNEL
			@group(0) @binding(x) var<uniform> uSelfIllumScaleBiasExpBrightness: vec4f;
		#endif
	#endif
#endif
