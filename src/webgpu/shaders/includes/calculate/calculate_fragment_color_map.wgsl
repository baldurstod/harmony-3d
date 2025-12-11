#ifdef USE_COLOR_MAP
	var<function> texelColor: vec4<f32> = textureSample(colorTexture, colorSampler, vTextureCoord.xy);
#else
	var<function> texelColor: vec4<f32> = vec4(1.0);
#endif
