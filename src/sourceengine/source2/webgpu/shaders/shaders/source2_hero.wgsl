#include matrix_uniforms
#include common_uniforms

//#include declare_texture_transform
//#include declare_vertex_detail_uv
//#include declare_vertex_skinning
//
//#include declare_fragment_standard
//#include declare_fragment_color_map
//#include declare_fragment_detail_map
//#include declare_fragment_normal_map
//#include declare_fragment_phong_exponent_map
//#include declare_fragment_alpha_test
//#include source1_declare_phong
//#include source1_declare_sheen
//#include source1_declare_selfillum
//#include declare_fragment_cube_map
//#include math::modulo

#include declare_vertex_skinning
#include declare_fragment_standard

#include declare_fragment_color_map
#include declare_fragment_normal_map
#include declare_fragment_alpha_test
#include declare_fragment_mask_map
#include declare_fragment_specular_map
#include source2_fragment_declare_detail_map
#include declare_fragment_cube_map
#include source2_decode_texture

#include source2_fragment_declare_separate_alpha_transform

#include declare_lights
//#include declare_shadow_mapping
#include declare_log_depth

#define uBaseMapAlphaPhongMask 0//TODO: set proper uniform
const defaultNormalTexel: vec4f = vec4(0.5, 0.5, 1.0, 1.0);

/*
uniform vec4 g_DiffuseModulation;
uniform vec3 uCubeMapTint;
uniform float uBlendTintColorOverBase;
uniform float uDetailBlendFactor;
*/
@group(0) @binding(x) var<uniform> g_DiffuseModulation: vec4f;
@group(0) @binding(x) var<uniform> uCubeMapTint: vec4f;
@group(0) @binding(x) var<uniform> uBlendTintColorOverBase: f32;
@group(0) @binding(x) var<uniform> g_flDetailBlendFactor: f32;
//@group(0) @binding(x) var<uniform> uDetailBlendFactor: f32;

#include varying_standard

@vertex
fn vertex_main(
#include declare_vertex_standard_params
) -> VertexOut
{
	var output : VertexOut;

	#include calculate_vertex_uv
	#include calculate_vertex
	#include calculate_vertex_skinning
	#include calculate_vertex_projection
	#include calculate_vertex_color
	#include calculate_vertex_shadow_mapping
	#include calculate_vertex_standard

	return output;
}

@fragment
fn fragment_main(fragInput: VertexOut) -> FragmentOutput
{

	var fragDepth: f32;
	var fragColor: vec4f;
	var diffuseColor: vec4f = vec4f(1.0);
	#include calculate_fragment_color_map
	#include calculate_fragment_cube_map
	#include source2_fragment_calculate_separate_alpha_transform
	#include calculate_fragment_normal_map
	#include calculate_fragment_specular_map
	#include source2_fragment_calculate_mask
	#include source2_fragment_calculate_detail
	diffuseColor *= texelColor;

	#include calculate_fragment_normal

	#ifdef USE_NORMAL_MAP
		let normal: vec3f = normalize(vec3f(texelNormal.ga * 2.0 - 1.0, 1.0));
		fragmentNormalCameraSpace = normalize(TBNMatrixCameraSpace * vec3(normal));
	#endif

	#include calculate_fragment_alpha_test

	#include source2_detail_blend



	fragColor = diffuseColor;


	//fragColor = vec4f(modulo_vec2f(fragInput.vTextureCoord.xy, vec2f(1.0)), 0.0, 1.0);

	#include output_fragment
}
