export default `
#ifdef USE_DETAIL_TEXTURE_TRANSFORM
	vDetailTextureCoord.xy = (uDetailTextureTransform * vec4(aTextureCoord, 1.0, 1.0)).st;
#else
	vDetailTextureCoord.xy = aTextureCoord;
#endif
`;
