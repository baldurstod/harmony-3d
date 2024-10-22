export default `
#ifdef USE_EXPONENT_MAP
	vec4 texelExponent = texture2D(exponentMap, vTextureCoord.xy);
#endif
`;
