#ifdef USE_TEXTURE2_TRANSFORM
	output.vTexture2Coord = vec4f((uTexture2Transform * vec4(texCoord, 1.0, 1.0)).xy, output.vTexture2Coord.zw);
#else
	output.vTexture2Coord = vec4f(texCoord.xy, output.vTexture2Coord.zw);
#endif
