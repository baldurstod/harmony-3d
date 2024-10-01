export default `
#include declare_attributes
#include declare_matrix_uniforms
#include declare_vertex_uv
#include declare_vertex_skinning
#include declare_shadow_mapping
#include declare_log_depth

#include varying_standard

void main(void) {
	#include compute_vertex_uv
	#include compute_vertex
	#include compute_vertex_skinning
	#include compute_vertex_projection
	#include compute_vertex_color
	#include compute_vertex_shadow_mapping
	#include compute_vertex_standard
	#include compute_vertex_log_depth
}
`;
