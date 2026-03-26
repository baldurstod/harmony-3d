export default `
#ifdef USE_MASK_MAP
	uniform sampler2D maskTexture;
#endif
#ifdef USE_MASK1_MAP
	uniform sampler2D mask1Texture;
#endif
#ifdef USE_MASK2_MAP
	uniform sampler2D mask2Texture;
#endif
`;
