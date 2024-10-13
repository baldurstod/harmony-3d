export default `
#include declare_attributes
#include declare_matrix_uniforms
#include declare_vertex_uv
#include declare_vertex_skinning
#include declare_shadow_mapping

#include source2_varying_hero_fluid

void main(void) {
	#include compute_vertex_uv
	#include compute_vertex
	#include compute_vertex_skinning
	#include compute_vertex_projection
	#include compute_vertex_shadow_mapping
	#include compute_vertex_standard
}
`;
