export default `
#ifdef USE_COLOR_MAP
	vec4 texelColor = texture2D(colorMap, vTextureCoord.xy);
#else
	vec4 texelColor = vec4(1.0);
#endif
`;
