var sheenMapColor: vec3f = vec3f(1.0);

#ifdef USE_SHEEN_MASK_MAP
	var sheenMaskCoords: vec2f = vec2f(0.0);
	if (g_flSheenDirection == 0.0) {
		sheenMaskCoords.x = fragInput.vVertexPositionModelSpace.z;
		sheenMaskCoords.y = fragInput.vVertexPositionModelSpace.y;
	} else if (g_flSheenDirection == 1.0) {
		sheenMaskCoords.x = fragInput.vVertexPositionModelSpace.z;
		sheenMaskCoords.y = fragInput.vVertexPositionModelSpace.x;
	} else {
		sheenMaskCoords.x = fragInput.vVertexPositionModelSpace.y;
		sheenMaskCoords.y = fragInput.vVertexPositionModelSpace.x;
	}

	sheenMaskCoords = (sheenMaskCoords - sheenUniforms.g_vPackedConst6.zw) / sheenUniforms.g_vPackedConst6.xy;

	sheenMapColor *= textureSample(sheenMaskTexture, sheenMaskSampler, sheenMaskCoords).rgb;
#endif


	//vec3 sheenMapTint = textureSample(sheenMapMask, (sheenMaskCoord - vec2(sheenMapMaskOffsetX)) / sheenMapMaskScaleX).rgb;
#ifdef USE_SHEEN_MAP
	sheenMapColor *= textureSample(sheenTexture, sheenSampler, reflectDir).rgb;
	sheenMapColor *= g_cCloakColorTint.rgb;

	fragColor = vec4f(fragColor.rgb + sheenMapColor * 3.0, fragColor.a);
#endif


#ifdef USE_SHEEN_MASK_MAP
	//albedo = abs(vec3(sheenMaskCoords.xy, 0.0));
#endif
