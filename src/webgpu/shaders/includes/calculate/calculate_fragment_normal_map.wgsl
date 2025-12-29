#ifdef USE_NORMAL_MAP
	let texelNormal: vec4f = textureSample(normalTexture, normalSampler, fragInput.vTextureCoord.xy);
#else
	let texelNormal: vec4f = vec4(0.5, 0.5, 1.0, 0.0);
#endif
