export default `
#ifdef USE_NORMAL_MAP
	vec4 texelNormal = texture2D(normalTexture, vTextureCoord.xy);
#else
	vec4 texelNormal = vec4(0.5, 0.5, 1.0, 0.0);
#endif
`;
