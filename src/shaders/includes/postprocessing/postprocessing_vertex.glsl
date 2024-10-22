export default `
#include declare_attributes
#include declare_matrix_uniforms

#include varying_standard

void main(void) {
	#include compute_vertex_uv
	#include compute_vertex
	#include compute_vertex_projection
}
`;
