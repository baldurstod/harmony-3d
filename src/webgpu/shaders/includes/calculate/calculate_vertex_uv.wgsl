#ifdef USE_TEXTURE_TRANSFORM
	output.vTextureCoord.xy = vec4f((textureTransform * vec4(texcoord, 1.0, 1.0)).xy, output.vTextureCoord.zw);
#else
	output.vTextureCoord = vec4f(texcoord.xy, output.vTextureCoord.zw);
#endif
