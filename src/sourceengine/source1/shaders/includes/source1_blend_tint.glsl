export default `
#ifdef BLEND_TINT_BY_BASE_ALPHA
	vec3 tintedColor = albedo * g_DiffuseModulation.rgb;
	tintedColor = mix(tintedColor, g_DiffuseModulation.rgb, uBlendTintColorOverBase);
	albedo = mix(albedo, tintedColor, texelColor.a);
#else
	albedo = albedo * g_DiffuseModulation.rgb;
#endif
`;
