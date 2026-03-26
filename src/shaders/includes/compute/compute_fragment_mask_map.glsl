export default `
#ifdef USE_MASK_MAP
	vec4 texelMask = texture2D(maskTexture, vTextureCoord.xy);
#endif
`;
