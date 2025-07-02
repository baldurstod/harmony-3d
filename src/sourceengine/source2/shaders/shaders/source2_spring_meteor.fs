export default `
#include declare_fragment_color_map
#include declare_fragment_normal_map
#include declare_fragment_alpha_test
#include declare_fragment_mask_map
#include source2_fragment_declare_detail_map
//#include source1_declare_phong

#include declare_lights
#include declare_shadow_mapping

uniform sampler2D g_tAmbientOcclusion;
uniform vec4 g_vColorTint;

#include source2_fragment_declare_separate_alpha_transform

uniform float g_flDetailBlendFactor;

#include source2_varying_spring_meteor
void main(void) {
	vec4 diffuseColor = vec4(1.0);
	#include compute_fragment_color_map
	#include source2_fragment_compute_separate_alpha_transform
	#include compute_fragment_normal_map
	#include source2_fragment_compute_mask
	#include source2_fragment_compute_detail
	diffuseColor *= texelColor;

	vec3 albedo = texelColor.rgb;

	#include compute_fragment_normal

	float phongMask = 1.0;
	float alpha = 1.0;
		float uPhongBoost = 1.0;
		float uPhongExponent = 1.0;

	#ifdef USE_NORMAL_MAP
		vec3 normal = normalize(vec3(texelNormal.ga * 2.0 - 1.0, 1.0));
		fragmentNormalCameraSpace = normalize(TBNMatrixCameraSpace * vec3(normal));
	#endif

	#include compute_fragment_alpha_test

	#include source2_detail_blend
	gl_FragColor.rgb = diffuseColor.rgb;
	gl_FragColor.a = diffuseColor.a;
	if (length(mod(gl_FragCoord.xy, vec2(2.0))) < 1.0) {
		//discard;
	}

#ifdef TESTING
#ifdef USE_SEPARATE_ALPHA_TRANSFORM
	/*gl_FragColor = vec4(vec3(g_vAlphaTexCoordOffset.y), 1.0);
	if (length(g_vAlphaTexCoordOffset.xy) < 0.5) {
		discard;
	}*/
#endif
#endif

/*
mask1.r: detail mask
mask1.g: diffuse warp
mask1.b: metalness
mask1.a: self illum
mask2.r: specular mask
mask2.g: rimlight
mask2.b: Base Tint Mask
mask2.a: Specular Exponent

*/


/* TEST SHADING BEGIN*/
	#include compute_lights_setup_vars



	BlinnPhongMaterial material;
	material.diffuseColor = diffuseColor.rgb;
#ifdef USE_PHONG_EXPONENT_MAP
	material.specularColor = mix(vec3(1.0), texelColor.rgb, texelPhongExponent.g) * phongMask;
	material.specularShininess = texelPhongExponent.r;
#else
	material.specularColor = vec3(phongMask);
	material.specularShininess = 5.0;//uPhongExponent;
#endif
	material.specularStrength = 1.0;//uPhongBoost;

#include compute_fragment_lights

/* TEST SHADING END*/





#ifdef SKIP_LIGHTING
	gl_FragColor.rgb = diffuseColor.rgb;
#else
	gl_FragColor.rgb = (reflectedLight.directSpecular + reflectedLight.directDiffuse + reflectedLight.indirectDiffuse);
#endif
gl_FragColor.a = texelColor.a;
//gl_FragColor.rgb = abs(normalize(fragmentNormalCameraSpace.rgb));
	#include compute_fragment_standard
	#include compute_fragment_render_mode
}
`;
