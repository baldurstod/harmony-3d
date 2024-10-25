export default `
#include declare_lights
#include declare_fragment_color_map
#include declare_fragment_normal_map
#include declare_fragment_alpha_test
#include declare_camera_position
uniform sampler2D aoMap;
uniform vec4 g_vColorTint;

#include compute_pbr

#include source2_varying_vr_simple

void main(void) {
	float metalness;
	float roughness;
	vec4 diffuseColor = vec4(1.0);
	#include compute_fragment_normal
	#include compute_fragment_normal_world_space
	#include compute_fragment_color_map
	#include compute_fragment_normal_map

#ifdef USE_COLOR_MAP
	diffuseColor *= pow(texelColor, vec4(2.2));
	metalness = texelColor.a;
#endif


#ifdef USE_NORMAL_MAP
	roughness = texelNormal.b;
#endif

	#include compute_fragment_alpha_test

	gl_FragColor = diffuseColor - vec4(vec3(0.5), 0.0);// * vec4(vec3(0.01), 1.0);
	//gl_FragColor = vec4(vTextureCoord, 1.0, 1.0);
	gl_FragColor = vec4(diffuseColor);
	//gl_FragColor.rgb *= 0.00000;
	gl_FragColor.a = 1.0;



	//gl_FragColor = vec4(vTextureCoord, 1.0, 1.0);
	//gl_FragColor = texture2D(colorMap, vTextureCoord * vec2(1.0, 1.0) + vec2(0.5, 0.0));
	gl_FragColor.rgb *= g_vColorTint.rgb;
	//gl_FragColor.rgb *= texture2D(g_tAmbientOcclusion, vTextureCoord).rrr;

#ifdef IS_TRANSLUCENT
	gl_FragColor.rgb = g_vColorTint.rgb * diffuseColor.rgb * diffuseColor.a;
	gl_FragColor.a = diffuseColor.a;
#else
	gl_FragColor.rgb = g_vColorTint.rgb * diffuseColor.rgb;
#endif
#ifdef USE_AO_MAP
	float ao = texture2D(aoMap, vTextureCoord.xy).r;
#else
	float ao = 1.0;
#endif
	#include compute_fragment_standard
#if NUM_PBR_LIGHTS > 0

#ifdef USE_NORMAL_MAP
		vec3 N = normalize(vec3(texelNormal.rg, 1.) * 2.0 - 1.0);
#else
		vec3 N = vec3(0., 0., 1.);
#endif
	N = normalize(TBNMatrixWorldSpace * N);
	vec3 albedo = diffuseColor.rgb;
	vec3 F0 = mix(Fdielectric, albedo, metalness);
	vec3 color = computePBR(uPbrLights, N, uCameraPosition, vVertexPositionWorldSpace.xyz, F0, metalness, roughness, albedo, ao);
	color = color / (color + vec3(1.0));
	// gamma correct
	color = pow(color, vec3(1.0/2.2));
	gl_FragColor.rgb = color;
#endif
}
`;
