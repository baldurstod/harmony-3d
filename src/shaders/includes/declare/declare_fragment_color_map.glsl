export default `
#ifdef USE_COLOR_MAP
	uniform sampler2D colorMap;
#endif
#ifdef USE_COLOR_1_MAP
	uniform sampler2D color1Map;
#endif
`;
