export default `
#ifdef USE_PHONG_EXPONENT_MAP
	vec4 texelPhongExponent = texture2D(phongExponentTexture, vTextureCoord.xy);
#endif
`;
