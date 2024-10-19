export default `
#include declare_attributes
#include declare_matrix_uniforms
#include declare_vertex_uv
#include declare_vertex_detail_uv
#include declare_vertex_skinning
#include declare_shadow_mapping
#include declare_log_depth

#include source1_varying_refract

void main(void) {
	#include compute_vertex_uv
	#include compute_vertex_detail_uv
	#include compute_vertex
	#include compute_vertex_skinning
	#include compute_vertex_projection
	#include compute_vertex_shadow_mapping
	#include compute_vertex_standard

	vVertexPositionModelSpace = vertexPositionModelSpace;
	#include compute_vertex_log_depth
}
`;
