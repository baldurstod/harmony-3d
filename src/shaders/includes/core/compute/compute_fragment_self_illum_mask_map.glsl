export default `
#ifdef USE_SELF_ILLUM_MASK_MAP
	vec4 texelSelfIllumMask = texture2D(selfIllumMaskMap, vTextureCoord.xy);
#endif
`;
