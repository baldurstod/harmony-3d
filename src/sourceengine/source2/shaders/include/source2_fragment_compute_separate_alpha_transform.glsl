export default `
#ifdef USE_SEPARATE_ALPHA_TRANSFORM
	#ifdef USE_COLOR_MAP
		texelColor.a = texture2D(colorMap, vTextureCoord.xy + g_vAlphaTexCoordOffset.st).a;
	#endif
#endif
`;
