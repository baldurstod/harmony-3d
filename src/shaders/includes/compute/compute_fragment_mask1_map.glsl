export default `
#ifdef USE_MASK1_MAP
	vec4 texelMask1 = texture2D(mask1Texture, vTextureCoord.xy);
#endif
`;
