export default `
#ifdef USE_DETAIL1_MAP
	uniform vec4 g_vDetailTexCoordScale;
	uniform vec4 g_vDetailTexCoordOffset;
	uniform vec4 g_vDetail1ColorTint;
	uniform sampler2D detail1Map;
#endif
#ifdef USE_DETAIL2_MAP
	uniform vec4 g_vDetail2TexCoordScale;
	uniform vec4 g_vDetail2TexCoordOffset;
	uniform vec4 g_vDetail2ColorTint;
	uniform sampler2D detail2Map;
#endif
`;
