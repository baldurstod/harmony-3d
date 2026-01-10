#ifdef USE_COLOR_MAP
	var<function> texelColor: vec4<f32> = textureSample(colorTexture, colorSampler, fragInput.vTextureCoord.xy);
#else
	var<function> texelColor: vec4<f32> = vec4(1.0);
#endif
#ifdef USE_COLOR_2_MAP
	var<function> texel2Color: vec4<f32> = textureSample(color2Texture, color2Sampler, fragInput.vTexture2Coord.xy);
#else
	var<function> texel2Color: vec4<f32> = vec4(1.0);
#endif
