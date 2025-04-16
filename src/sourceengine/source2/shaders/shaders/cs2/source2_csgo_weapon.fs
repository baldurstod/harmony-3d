export default `
#include declare_camera_position
#include declare_fragment_color_map
#include declare_fragment_normal_map
#include declare_fragment_alpha_test
#include declare_fragment_mask_map
#include declare_fragment_specular_map
#include source2_fragment_declare_detail_map
#include declare_fragment_cube_map
#include source2_fragment_declare_cs2_stickers
//#include source1_declare_phong

#include declare_lights
#include declare_shadow_mapping

uniform sampler2D g_tAmbientOcclusion;
uniform vec4 g_vColorTint;

#include source2_fragment_declare_separate_alpha_transform

uniform float g_flDetailBlendFactor;
uniform float g_flMaterialCloakFactor;

#include source2_varying_csgo_weapon

void main(void) {
	vec4 diffuseColor = vec4(1.0);
	#include compute_fragment_color_map
	#include compute_fragment_cube_map
	#include source2_fragment_compute_separate_alpha_transform
	#include compute_fragment_normal_map
	#include compute_fragment_specular_map
	#include source2_fragment_compute_mask
	#include source2_fragment_compute_detail
	diffuseColor *= texelColor;

#define DETAIL_MASK texelMask1.r
//#define FRESNEL_WARP texelMask1.g
#define METALNESS_MASK texelMask1.b
#define SELFILLUM_MASK texelMask1.a

#define SPECULAR_INTENSITY texelMask2.r
#define RIMLIGHT_INTENSITY texelMask2.g
#define TINT_MASK texelMask2.b
#define SPECULAR_EXPONENT texelMask2.a

#ifdef ENABLE_CLOAK
	// TODO: fully code cloak, for now it's just a fix for io
	if (g_flMaterialCloakFactor == 1.0) {
		discard;
	}
#endif

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





#include compute_fragment_render_mode
#ifdef SKIP_LIGHTING
	gl_FragColor.rgb = diffuseColor.rgb;
#else
	gl_FragColor.rgb = (reflectedLight.directSpecular + reflectedLight.directDiffuse + reflectedLight.indirectDiffuse);
#endif
gl_FragColor.a = texelColor.a;
//gl_FragColor.rgb = abs(normalize(fragmentNormalCameraSpace.rgb));

#ifdef USE_CUBE_MAP
	gl_FragColor += cubeMapColor * METALNESS_MASK;//METALNESS_MASK;
#endif

	#include source2_fragment_compute_cs2_stickers

	if (length (vVertexPositionModelSpace.xy - g_vSticker0Offset.xy*15.) < 15.) {
		gl_FragColor = vec4(1., 0., 0., 0.);
	}

	if (length (vVertexPositionModelSpace.xz - g_vSticker0Offset.xy * 15.) < 5.) {
		gl_FragColor = vec4(1., 0., 0., 0.);
	}

	gl_FragColor.a = 1.0;
	gl_FragColor = texture2D(stickerWepInputsMap, vTextureCoord.xy);

	gl_FragColor = vec4(vTextureCoord.xy, 0.0, 1.0);

//	gl_FragColor = texture2D(stickerWepInputsMap, vTextureCoord.xy);
//gl_FragColor = texture2D(colorMap, vTextureCoord.xy);



	#include compute_fragment_standard
}
`;
