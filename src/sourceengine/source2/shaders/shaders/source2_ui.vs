export default `
#include declare_attributes
#include declare_matrix_uniforms
#include declare_vertex_skinning

#include source2_varying_ui

void main(void) {
	#include compute_vertex_uv
	#include compute_vertex
	#include compute_vertex_skinning
	#include compute_vertex_projection
	vTextureCoord.y = 1.0 - vTextureCoord.y;
}
`;
