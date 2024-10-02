export default `
#ifdef USE_COLOR_TEXTURE
	vec3 colorTexel = texture2D(uColorTexture, vTextureCoord.xy).rgb;
#else
	vec3 colorTexel = uColor.rgb;
#endif
`;
