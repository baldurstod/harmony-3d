export default `
#include declare_fragment_color_map
#include declare_fragment_normal_map
#include declare_fragment_alpha_test
#include declare_fragment_mask_map
#include source2_fragment_declare_detail_map

uniform sampler2D g_tAmbientOcclusion;
uniform vec4 g_vColorTint;

#include source2_fragment_declare_separate_alpha_transform

uniform float g_flDetailBlendFactor;
uniform float g_flOpacityScale;

uniform vec4 TextureTranslucency;

#include source2_varying_crystal

void main(void) {
	vec4 diffuseColor = vec4(1.0);
	#include compute_fragment_color_map
	#include source2_fragment_compute_separate_alpha_transform
	#include compute_fragment_normal_map
	#include source2_fragment_compute_mask
	#include source2_fragment_compute_detail
	diffuseColor *= texelColor;

	#include compute_fragment_alpha_test

	#include source2_detail_blend
	gl_FragColor.rgb = diffuseColor.rgb;
	gl_FragColor.a = 1.0;
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

//#ifdef TESTING
//	gl_FragColor = vec4(1.0, 0.0, 0.5, 1.0);
//	if (length(floor((gl_FragCoord.xy + vec2(15.0)) / 30.0) * 30.0 - gl_FragCoord.xy) > 10.0) {
//		discard;
//	}
//#endif
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
	#include compute_fragment_standard
gl_FragColor.rgb *= TextureTranslucency.rgb;
}
`;
