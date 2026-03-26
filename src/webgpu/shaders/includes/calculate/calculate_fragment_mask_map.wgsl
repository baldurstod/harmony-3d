#ifdef USE_MASK_MAP
	let texelMask = textureSample(maskTexture, maskSampler, fragInput.vTextureCoord.xy);
#endif
