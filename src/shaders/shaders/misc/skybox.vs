export default `
#include declare_attributes
#include declare_matrix_uniforms
#include declare_vertex_uv
#include declare_vertex_skinning

#include varying_standard

void main(void) {
	#include compute_vertex
	#include compute_vertex_skinning
	#include compute_vertex_projection
	#include compute_vertex_color

	vVertexPositionModelSpace = vertexPositionModelSpace;

	#include compute_vertex_standard
}
`;
