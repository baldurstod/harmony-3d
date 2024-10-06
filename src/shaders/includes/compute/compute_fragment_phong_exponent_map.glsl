export default `
#ifdef USE_PHONG_EXPONENT_MAP
	vec4 texelPhongExponent = texture2D(phongExponentMap, vTextureCoord.xy);
#endif
`;
