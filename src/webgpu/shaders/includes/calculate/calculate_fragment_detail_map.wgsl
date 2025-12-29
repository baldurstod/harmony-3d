#ifdef USE_DETAIL_MAP
	let texelDetail: vec4f = textureSample(detailTexture, detailSampler, fragInput.vDetailTextureCoord.xy);
#else
	let texelDetail: vec4f = vec4(0.0);
#endif
