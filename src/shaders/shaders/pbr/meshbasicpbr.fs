export default `
#include declare_fragment_standard
#include declare_lights
#include declare_shadow_mapping
#include declare_camera_position

#include declare_fragment_diffuse
#include declare_fragment_color_map
#include declare_fragment_uniforms
uniform float uMetalness;
uniform float uRoughness;
uniform sampler2D uColorTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uMetalnessTexture;
uniform sampler2D uRoughnessTexture;

#include declare_fragment_ibl
#include compute_pbr

#include varying_standard

void main(void) {
	#include compute_fragment_normal
	#include compute_fragment_normal_world_space
	#include compute_fragment_diffuse
	#include compute_fragment_color_map
#ifdef USE_COLOR_MAP
	diffuseColor *= texelColor;
#endif
	gl_FragColor = diffuseColor;

const int NumLights = 1;
/*PBRLight lights[NUM_PBR_LIGHTS] = PBRLight[](PBRLight(vec3(0, -1000, 0), vec3(1)));*/
#include sample_color_texture
vec3 albedo = pow(colorTexel, vec3(2.2));

const vec3 Fdielectric = vec3(0.04);
float metalness = 0.;
float roughness = 0.;
#ifdef USE_METALNESS_TEXTURE
	vec4 metalnessTexel = texture2D(uMetalnessTexture, vTextureCoord.xy);
	metalness = metalnessTexel.r;
#else
	metalness = uMetalness;
#endif
#ifdef USE_ROUGHNESS_TEXTURE
	vec4 roughnessTexel = texture2D(uRoughnessTexture, vTextureCoord.xy);
	roughness = roughnessTexel.r;
#else
	roughness = uRoughness;
#endif


	#ifdef USE_NORMAL_TEXTURE
		vec4 normalTexel = texture2D(uNormalTexture, vTextureCoord.xy);
		vec3 N = normalTexel.rgb * 2.0 - 1.0;
	#else
		vec3 N = vec3(0., 0., 1.0);
	#endif


	N = normalize(TBNMatrixWorldSpace * N);

vec3 F0 = mix(Fdielectric, albedo, metalness);
	#include compute_fragment_standard
	gl_FragColor.rgb = vec3(metalness * roughness);
#if NUM_PBR_LIGHTS > 0
	vec3 color = computePBR(uPbrLights, N, uCameraPosition, vVertexPositionWorldSpace.xyz, F0, metalness, roughness, albedo, 1.);
	color = color / (color + vec3(1.0));
	// gamma correct
	color = pow(color, vec3(1.0/2.2));
	gl_FragColor.rgb = color;
#endif
}
`;
