#if defined(USE_SELF_ILLUM)// && COLOR_MAP_ALPHA_BITS > 0
	#ifdef USE_SELF_ILLUM_ENVMAPMASK_ALPHA
		#ifdef USE_CUBE_MAP
			let selfIllumComponent: vec3f = uSelfIllumTint * albedo;
			let Adj_Alpha:f 32 = 1. * cubeMapColor.a;
			diffuse = max(0., 1. - Adj_Alpha) * diffuse + Adj_Alpha * selfIllumComponent;
		#endif
	#else
		#ifdef USE_SELF_ILLUM_MASK_MAP
			let selfIllumMask: vec3f = textureSample(uSelfIllumMaskTexture, uSelfIllumMaskSampler, fragInput.vTextureCoord.xy).rgb;
		#else
			let selfIllumMask: vec3f = texelColor.aaa;
		#endif

		#if !defined(SKIP_SELF_ILLUM_FRESNEL) && defined(USE_SELF_ILLUM_FRESNEL)
			let worldVertToEyeVectorXYZ_tangentSpaceVertToEyeVectorZ: vec3f = normalize(uCameraPosition - vVertexPositionWorldSpace.xyz);
			let vVertexNormal: vec3f = normalize(vVertexNormalWorldSpace.xyz);

			let flSelfIllumFresnel: f32 = (
										pow(
											saturate(
												dot(vVertexNormal, normalize(worldVertToEyeVectorXYZ_tangentSpaceVertToEyeVectorZ))
											), uSelfIllumScaleBiasExpBrightness.z
										) * uSelfIllumScaleBiasExpBrightness.x) + uSelfIllumScaleBiasExpBrightness.y;
			diffuse = mix(diffuse, albedo * uSelfIllumTint * uSelfIllumScaleBiasExpBrightness.w, selfIllumMask * saturate(flSelfIllumFresnel));
		#else
			// Not sure why I need to multiply by g_DiffuseModulation.rgb, but it works better
			diffuse = mix(diffuse, albedo * uSelfIllumTint * g_DiffuseModulation.rgb, selfIllumMask);
		#endif
	#endif
#endif
