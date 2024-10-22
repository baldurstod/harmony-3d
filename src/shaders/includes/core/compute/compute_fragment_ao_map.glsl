export default `
#ifdef USE_AO_MAP
	vec4 texelAo = texture2D(aoMap, vTextureCoord.xy);
#endif
`;
