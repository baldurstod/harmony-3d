#ifdef USE_DETAIL1_MAP
	let detail1Coord: vec2f = fragInput.vTextureCoord.xy * detailTextures.g_vDetailTexCoordScale.xy + detailTextures.g_vDetailTexCoordOffset.xy;
	let detail1Color: vec4f = detailTextures.g_vDetail1ColorTint * textureSample(detail1Texture, detail1Sampler, detail1Coord);
#endif
#ifdef USE_DETAIL2_MAP
	let detail2Coord: vec2f = fragInput.vTextureCoord.xy * detailTextures.g_vDetail2TexCoordOffset.xy + detailTextures.g_vDetail2TexCoordOffset.xy;
	let detail2Color: vec4f = detailTextures.g_vDetail2ColorTint * textureSample(detail2Texture, detail2Sampler, detail2Coord);
#endif
