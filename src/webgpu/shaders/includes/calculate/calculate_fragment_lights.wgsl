#if NUM_POINT_LIGHTS > 0
	#if defined(USE_SHADOW_MAPPING) && (NUM_POINT_LIGHT_SHADOWS > 0)
		PointLightShadow pointLightShadow;
	#endif

	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			computePointLightIrradiance(uPointLights[i], geometry, directLight);
			#ifdef USE_SHADOW_MAPPING
				pointLightShadow = uPointLightShadows[ i ];
				directLight.color *= getPointShadow( uPointShadowMap[i], pointLightShadow.mapSize, /*pointLightShadow.shadowBias*/0.0, /*pointLightShadow.shadowRadius*/0.0, vPointShadowCoord[i], pointLightShadow.near, pointLightShadow.far);
			#endif
			RE_Direct( directLight, geometry, material, reflectedLight );
		}
	#endif

	#pragma unroll
	for ( int i = NUM_POINT_LIGHT_SHADOWS; i < NUM_POINT_LIGHTS; i ++ ) {
		computePointLightIrradiance(uPointLights[i], geometry, directLight);
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
#endif

#if NUM_SPOT_LIGHTS > 0
	#if defined(USE_SHADOW_MAPPING) && (NUM_SPOT_LIGHT_SHADOWS > 0)
		SpotLightShadow spotLightShadow;
	#endif

	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#pragma unroll
		for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
			computeSpotLightIrradiance(uSpotLights[i], geometry, directLight);
			#ifdef USE_SHADOW_MAPPING
				spotLightShadow = uSpotLightShadows[ i ];
				directLight.color *= getShadow( uSpotShadowMap[ i ], spotLightShadow.mapSize, /*spotLightShadow.shadowBias*/0.0, /*spotLightShadow.shadowRadius*/0.0, vSpotShadowCoord[ i ] );
			#endif
			RE_Direct( directLight, geometry, material, reflectedLight );
		}
	#endif

	#pragma unroll
	for ( int i = NUM_SPOT_LIGHT_SHADOWS; i < NUM_SPOT_LIGHTS; i ++ ) {
		computeSpotLightIrradiance(uSpotLights[i], geometry, directLight);
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
#endif

#if defined( RE_IndirectDiffuse )

	let iblIrradiance: vec3f = vec3( 0.0 );

	let iblIrradiance: vec3f = getAmbientLightIrradiance( uAmbientLight );

	irradiance += getLightProbeIrradiance( lightProbe, geometry );

	#if ( NUM_HEMI_LIGHTS > 0 )

		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );

		}

	#endif

#endif

#if defined( RE_IndirectDiffuse )
	#ifndef SKIP_LIGHT_WARP
		#ifdef USE_LIGHT_WARP_MAP
			irradiance *= getLightWarp(saturate(luminance(irradiance)));
		#endif
	#endif

	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );

#endif

#if defined( RE_IndirectSpecular )

	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );

#endif
