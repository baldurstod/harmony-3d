#ifdef USE_TEXTURE_TRANSFORM
	output.vTextureCoord = vec4f((textureTransform * vec4(texCoord, 1.0, 1.0)).xy, output.vTextureCoord.zw);
#else
	output.vTextureCoord = vec4f(texCoord.xy, output.vTextureCoord.zw);
#endif
