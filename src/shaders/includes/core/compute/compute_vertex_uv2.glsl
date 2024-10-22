export default `
#ifdef USE_TEXTURE2_TRANSFORM
	vTexture2Coord.xy = (uTexture2Transform * vec4(aTextureCoord, 1.0, 1.0)).st;
#else
	vTexture2Coord.xy = aTextureCoord;
#endif
`;
