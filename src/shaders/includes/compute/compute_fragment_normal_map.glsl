export default `
#ifdef USE_NORMAL_MAP
	vec4 texelNormal = texture2D(normalMap, vTextureCoord.xy);
#endif
`;
