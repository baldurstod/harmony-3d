export default `
#define FLAT_SHADING
const vec4 defaultNormalTexel = vec4(0.5, 0.5, 1.0, 1.0);
#include declare_lights
#include declare_shadow_mapping

uniform vec3 phongfresnelranges;

#include declare_fragment_color_map
#include declare_fragment_normal_map
#include declare_fragment_alpha_test

#include varying_standard

void main(void) {
	vec4 diffuseColor = vec4(1.0);

	vec3 lightmapColor1 = vec3(1.0, 1.0, 1.0);
	vec3 lightmapColor2 = vec3(1.0, 1.0, 1.0);
	vec3 lightmapColor3 = vec3(1.0, 1.0, 1.0);
	vec3 diffuseLighting = vec3(1.0);

	#include compute_fragment_color_map
	#include compute_fragment_normal_map
	#include compute_fragment_alpha_test

	#include compute_fragment_normal

	vec3 albedo = texelColor.rgb;

	#ifdef USE_SSBUMP
		vec3 tangentSpaceNormal = texelNormal.xyz;

		diffuseLighting = texelNormal.x * lightmapColor1 +
						  texelNormal.y * lightmapColor2 +
						  texelNormal.z * lightmapColor3;
	#else
		#ifdef USE_NORMAL_MAP
			vec3 tangentSpaceNormal = 2.0 * texelNormal.xyz - 1.0;
		#else
			vec3 tangentSpaceNormal = 2.0 * defaultNormalTexel.xyz - 1.0;
		#endif
	#endif

	fragmentNormalCameraSpace = normalize(TBNMatrixCameraSpace * tangentSpaceNormal);
	#include compute_lights_setup_vars
	BlinnPhongMaterial material;
	material.diffuseColor = texelColor.rgb * diffuseLighting;
	material.specularColor = vec3(1.0);//specular;
	material.specularShininess = 5.0;//shininess;
	material.specularStrength = 1.0;//specularStrength;

	#include compute_fragment_lights

	/*gl_FragColor = textureColor;*/
	gl_FragColor.a = 1.0;
#ifdef USE_PHONG_SHADING
	gl_FragColor.rgb = (reflectedLight.directSpecular + reflectedLight.directDiffuse + reflectedLight.indirectDiffuse);
#else
	gl_FragColor.rgb = (reflectedLight.directDiffuse + reflectedLight.indirectDiffuse * 0.0/*TODO*/);
#endif


#ifdef SKIP_LIGHTING
	gl_FragColor.rgb = albedo;
#endif
	#include compute_fragment_standard
}
`;
