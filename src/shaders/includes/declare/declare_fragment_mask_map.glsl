export default `
#ifdef USE_MASK_MAP
	uniform sampler2D maskMap;
#endif
#ifdef USE_MASK1_MAP
	uniform sampler2D mask1Map;
#endif
#ifdef USE_MASK2_MAP
	uniform sampler2D mask2Map;
#endif
`;
