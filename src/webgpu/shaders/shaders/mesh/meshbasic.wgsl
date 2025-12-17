#include matrix_uniforms
#include declare_texture_transform
#include declare_vertex_skinning

#include declare_fragment_diffuse
#include declare_fragment_color_map
#include declare_fragment_alpha_test

#include declare_lights
//#include declare_shadow_mapping
#include declare_log_depth

#include varying_standard

@vertex
fn vertex_main(
	@location(0) position: vec3f,
	@location(1) normal: vec3f,
	@location(2) texcoord: vec2f,
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
	#include calculate_vertex_log_depth

	return output;
}

struct FragmentOutput {
	@location(0) color: vec4<f32>,
	@builtin(frag_depth) depth: f32,
};

@fragment
fn fragment_main(fragInput: VertexOut) -> FragmentOutput
{
	var fragColor: vec4f;
	var fragDepth: f32 = fragInput.position.w;
	#include calculate_fragment_diffuse
	#include calculate_fragment_color_map
#ifdef USE_COLOR_MAP
	diffuseColor *= texelColor;
#endif
	fragColor = diffuseColor;

	#include calculate_fragment_standard

	return FragmentOutput(fragColor, fragDepth);
}
