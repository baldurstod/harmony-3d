export default `
#ifdef USE_TEXTURE_TRANSFORM
	vTextureCoord.xy = (uTextureTransform * vec4(aTextureCoord, 1.0, 1.0)).st;
#else
	vTextureCoord.xy = aTextureCoord;
#endif
`;
