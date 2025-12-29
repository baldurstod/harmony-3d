#ifdef USE_PHONG_EXPONENT_MAP
	let texelPhongExponent: vec4f = textureSample(phongExponentTexture, phongExponentSampler, fragInput.vTextureCoord.xy);
#endif
