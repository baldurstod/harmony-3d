#include matrix_uniforms
#include common_uniforms

@group(0) @binding(x) var<uniform> uSpacing: f32;

#include declare_fragment_standard
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
	@location(2) texCoord: vec2f,
) -> VertexOut
{
	var output : VertexOut;

	#include calculate_vertex
	#include calculate_vertex_skinning
	#include calculate_vertex_projection
	#include calculate_vertex_shadow_mapping
	#include calculate_vertex_standard
	#include calculate_vertex_log_depth

	return output;
}

@fragment
fn fragment_main(fragInput: VertexOut) -> FragmentOutput
{
	var fragColor: vec4f;
	var fragDepth: f32;

	let halfSpacing: f32 = uSpacing * 0.5;
	let radSpacing: f32 = TWO_PI / uSpacing;

	var xLines: vec4f = saturate(mix(vec4(0.0), vec4(1.0), cos(fragInput.vVertexPositionWorldSpace.y * radSpacing) * 100.0 - 99.0));
	var yLines: vec4f = saturate(mix(vec4(0.0), vec4(1.0), cos(fragInput.vVertexPositionWorldSpace.x * radSpacing) * 100.0 - 99.0));


	if (abs(fragInput.vVertexPositionWorldSpace.y) < halfSpacing) {
		xLines.g = 0.0;
		xLines.b = 0.0;
	}
	if (abs(fragInput.vVertexPositionWorldSpace.x) < halfSpacing) {
		yLines.r = 0.0;
		yLines.b = 0.0;
	}

	fragColor = xLines + yLines;
	fragColor = vec4(fragColor.rgb * fragColor.a, fragColor.a);

	//fragColor = diffuseColor;

	#include calculate_fragment_standard
	#include output_fragment
}
