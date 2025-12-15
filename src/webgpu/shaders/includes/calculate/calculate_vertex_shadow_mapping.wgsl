#ifdef USE_SHADOW_MAPPING
	var shadowWorldPosition: vec4f;
	#if (NUM_POINT_LIGHT_SHADOWS > 0)
		for (int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++) {
			shadowWorldPosition = vertexPositionWorldSpace;
			vPointShadowCoord[i] = uPointShadowMatrix[i] * shadowWorldPosition;
		}
	#endif
	#if (NUM_SPOT_LIGHT_SHADOWS > 0)
		for (int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++) {
			shadowWorldPosition = vertexPositionWorldSpace;
			vSpotShadowCoord[i] = uSpotShadowMatrix[i] * shadowWorldPosition;
		}
	#endif
#endif
