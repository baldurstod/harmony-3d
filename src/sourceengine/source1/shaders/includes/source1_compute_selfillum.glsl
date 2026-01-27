export default `
#if defined(USE_SELF_ILLUM)/* && COLOR_MAP_ALPHA_BITS > 0*/
	#ifdef USE_SELF_ILLUM_ENVMAPMASK_ALPHA
		#ifdef USE_CUBE_MAP
			vec3 selfIllumComponent = uSelfIllumTint * albedo;
			float Adj_Alpha = 1. * cubeMapColor.a;
			diffuse = max(0., 1. - Adj_Alpha) * diffuse + Adj_Alpha * selfIllumComponent;
		#endif
	#else
		#ifdef USE_SELF_ILLUM_MASK_MAP
			vec3 selfIllumMask = texture2D(uSelfIllumMaskMap, vTextureCoord.xy).rgb;
		#else
			vec3 selfIllumMask = texelColor.aaa;
		#endif

		#if !defined(SKIP_SELF_ILLUM_FRESNEL) && defined(USE_SELF_ILLUM_FRESNEL)
			vec3 worldVertToEyeVectorXYZ_tangentSpaceVertToEyeVectorZ = normalize(uCameraPosition - vVertexPositionWorldSpace.xyz);
			vec3 vVertexNormal = normalize(vVertexNormalWorldSpace.xyz);

			float flSelfIllumFresnel = (
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
`;
