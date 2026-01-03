#include matrix_uniforms
#include varying_standard

@vertex
fn vertex_main(
	@location(x) position: vec3f,
	@location(x) normal: vec3f,
	@location(x) texCoord: vec2f,
) -> VertexOut
{
	var output : VertexOut;

	#include calculate_vertex_uv
	#include calculate_vertex
	#include calculate_vertex_projection

	return output;
}
