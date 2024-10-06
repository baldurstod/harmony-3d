export default `
#ifdef USE_SELF_ILLUM
	uniform vec3 uSelfIllumTint;

	#ifdef USE_SELF_ILLUM_MASK_MAP
		uniform sampler2D uSelfIllumMaskMap;
	#endif

	#ifndef SKIP_SELF_ILLUM_FRESNEL
		#ifdef USE_SELF_ILLUM_FRESNEL
			uniform vec4 uSelfIllumScaleBiasExpBrightness;
		#endif
	#endif
#endif
`;
