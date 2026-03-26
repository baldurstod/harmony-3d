#ifdef USE_SEPARATE_ALPHA_TRANSFORM
	#ifdef USE_COLOR_MAP
		texelColor.a = textureSample(colorTexture, colorSampler, fragInput.vTextureCoord.xy + g_vAlphaTexCoordOffset.xy).a;
	#endif
#endif
