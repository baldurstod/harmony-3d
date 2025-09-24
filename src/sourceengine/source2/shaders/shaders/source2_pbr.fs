export default `
#include declare_camera_position
#include declare_fragment_color_map
#include declare_fragment_normal_map
#include declare_fragment_alpha_test
#include declare_fragment_mask_map
#include declare_fragment_specular_map
#include source2_fragment_declare_detail_map
#include declare_fragment_cube_map
#include declare_fragment_self_illum_mask_map

#include declare_lights
#include declare_shadow_mapping

uniform sampler2D g_tAmbientOcclusion;
uniform vec4 g_vColorTint;

#include source2_fragment_declare_separate_alpha_transform

uniform float g_flDetailBlendFactor;
uniform float g_flMaterialCloakFactor;

// Constant normal incidence Fresnel factor for all dielectrics.

struct AnalyticalLight {
	vec3 direction;
	vec3 radiance;
};
#include compute_pbr

const float Epsilon = 0.00001;
const vec4 defaultNormalTexel = vec4(0.5, 0.5, 1.0, 1.0);
const int NumLights = 1;
AnalyticalLight lights[NumLights] = AnalyticalLight[](AnalyticalLight(vec3(40., 0., 50.), vec3(1)));

#include source2_varying_pbr
void main(void) {
	#include compute_fragment_normal
	#include compute_fragment_normal_world_space
	#include compute_fragment_color_map
	#include compute_fragment_normal_map
	#include compute_fragment_self_illum_mask_map


	// Sample input textures to get shading model params.
	vec3 albedo = texelColor.rgb;//vec3 albedo = texture(albedoTexture, vin.texcoord).rgb;
	float metalness = texelColor.a;//float metalness = texture(metalnessTexture, vin.texcoord).r;
	float roughness = 0.1;//float roughness = texture(roughnessTexture, vin.texcoord).r;

	// Outgoing light direction (vector from world-space fragment position to the "eye").
	vec3 Lo = normalize(vec3(40, 0., 50.) - vVertexPositionWorldSpace.xyz);//vec3 Lo = normalize(eyePosition - vin.position);

	// Get current fragment's normal and transform to world space.
#ifdef USE_NORMAL_MAP
	vec3 N = normalize(texelNormal.rgb);//vec3 N = normalize(2.0 * texture(normalTexture, vin.texcoord).rgb - 1.0);
#else
	vec3 N = normalize(defaultNormalTexel.rgb);//vec3 N = normalize(2.0 * texture(normalTexture, vin.texcoord).rgb - 1.0);
#endif
	N = normalize(TBNMatrixWorldSpace * N);//N = normalize(vin.tangentBasis * N);

	// Angle between surface normal and outgoing light direction.
	float cosLo = max(0.0, dot(N, Lo));


	// Specular reflection vector.
	vec3 Lr = 2.0 * cosLo * N - Lo;

	// Fresnel reflectance at normal incidence (for metals use albedo color).
	vec3 F0 = mix(Fdielectric, albedo, metalness);




	gl_FragColor.a = 1.0;

	#include compute_fragment_standard


	gl_FragColor.rgb = abs(N.rgb);
	gl_FragColor.rgb = abs(vVertexNormalModelSpace.rgb);
#if NUM_PBR_LIGHTS > 0
	vec3 color = computePBR(uPbrLights, N, uCameraPosition, vVertexPositionWorldSpace.xyz, F0, metalness, roughness, albedo, 1.);
	color = color / (color + vec3(1.0));
	// gamma correct
	color = pow(color, vec3(1.0/2.2));
	gl_FragColor.rgb = color;
#endif
	gl_FragColor.rgb = texelColor.rgb;
}
`;
