export default `
vec3 sheenMapColor = vec3(1.0);

#ifdef USE_SHEEN_MASK_MAP
	vec2 sheenMaskCoords = vec2(0.0);
	if (g_flSheenDirection == 0.0) {
		sheenMaskCoords.x = vVertexPositionModelSpace.z;
		sheenMaskCoords.y = vVertexPositionModelSpace.y;
	} else if (g_flSheenDirection == 1.0) {
		sheenMaskCoords.x = vVertexPositionModelSpace.z;
		sheenMaskCoords.y = vVertexPositionModelSpace.x;
	} else {
		sheenMaskCoords.x = vVertexPositionModelSpace.y;
		sheenMaskCoords.y = vVertexPositionModelSpace.x;
	}

	sheenMaskCoords = (sheenMaskCoords - g_vPackedConst6.zw) / g_vPackedConst6.xy;

	sheenMapColor *= texture2D(sheenMaskTexture, sheenMaskCoords).rgb;
#endif


	//vec3 sheenMapTint = texture2D(sheenMapMask, (sheenMaskCoord - vec2(sheenMapMaskOffsetX)) / sheenMapMaskScaleX).rgb;
#ifdef USE_SHEEN_MAP
	sheenMapColor *= vec4(textureCube(sheenTexture, reflectDir)).rgb;
	sheenMapColor *= g_cCloakColorTint.rgb;

	gl_FragColor.rgb += sheenMapColor * 3.0;
#endif


#ifdef USE_SHEEN_MASK_MAP
	//albedo = abs(vec3(sheenMaskCoords.xy, 0.0));
#endif
`;
