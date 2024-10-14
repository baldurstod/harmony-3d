export default `
#ifdef USE_DETAIL1_MAP
	vec2 detail1Coord = vTextureCoord.xy * g_vDetailTexCoordScale.xy + g_vDetailTexCoordOffset.xy;
	vec4 detail1Color = g_vDetail1ColorTint * texture2D(detail1Map, detail1Coord);
#endif
#ifdef USE_DETAIL2_MAP
	vec2 detail2Coord = vTextureCoord.xy * g_vDetail2TexCoordOffset.xy + g_vDetail2TexCoordOffset.xy;
	vec4 detail2Color = g_vDetail2ColorTint * texture2D(detail2Map, detail2Coord);
#endif
`;
