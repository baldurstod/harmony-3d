#include matrix_uniforms
#include common_uniforms
#include declare_texture_transform
#include declare_vertex_detail_uv
#include declare_vertex_skinning

#include declare_fragment_standard
#include declare_fragment_color_map
#include declare_fragment_detail_map
#include declare_fragment_normal_map
#include declare_fragment_phong_exponent_map
#include declare_fragment_alpha_test
#include source1_declare_phong
#include source1_declare_sheen
#include source1_declare_selfillum
#include declare_fragment_cube_map

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
@group(0) @binding(x) var<uniform> uDetailBlendFactor: f32;

#include varying_standard

@vertex
fn vertex_main(
#include declare_vertex_standard_params
) -> VertexOut
{
	var output : VertexOut;

	#include calculate_vertex_uv
	#include calculate_vertex_detail_uv
	#include calculate_vertex
	#include calculate_vertex_skinning
	#include calculate_vertex_projection
	#include calculate_vertex_color
	#include calculate_vertex_shadow_mapping
	#include calculate_vertex_standard
	#include calculate_vertex_log_depth

	output.vVertexPositionModelSpace = vertexPositionModelSpace;

	return output;
}

@fragment
fn fragment_main(fragInput: VertexOut) -> FragmentOutput
{
	#include calculate_fragment_normal_map
	var fragColor: vec4f = vec4f(texelNormal.rgb, 1.0);
	discard;
	#include output_fragment
}
