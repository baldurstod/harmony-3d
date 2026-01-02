#ifdef USE_DETAIL_MAP
	#ifdef USE_DETAIL_TEXTURE_TRANSFORM
		output.vDetailTextureCoord = vec4((uDetailTextureTransform * vec4(texCoord, 1.0, 1.0)).xy, output.vDetailTextureCoord.zw);
	#else
		output.vDetailTextureCoord.xy = texCoord;
	#endif
#endif
