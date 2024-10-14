export default `
#ifdef USE_MASK_MAP
	vec4 texelMask = texture2D(maskMap, vTextureCoord.xy);
#endif
`;
