export default `
#ifdef IS_TRANSLUCENT
	#if !defined(BASE_ALPHA_ENV_MAP_MASK) && !defined(SELF_ILLUM) && !defined(BLEND_TINT_BY_BASE_ALPHA) && !defined(USE_COLOR_ALPHA_AS_PHONG_MASK)
		alpha *= texelColor.a;
	#endif
#endif
`;
