#ifdef USE_SPECULAR_MAP
	let texelSpecular: vec4f = textureSample(specularTexture, specularSampler, fragInput.vTextureCoord.xy);
#endif
