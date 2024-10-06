export default `
#ifdef USE_DETAIL_MAP
	vec4 texelDetail = texture2D(detailMap, vDetailTextureCoord.xy);
#else
	vec4 texelDetail = vec4(0.0);
#endif
`;
