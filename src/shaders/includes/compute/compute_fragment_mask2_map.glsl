export default `
#ifdef USE_MASK2_MAP
	vec4 texelMask2 = texture2D(mask2Map, vTextureCoord.xy);
#endif
`;
