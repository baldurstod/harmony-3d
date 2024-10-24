export default `
#include declare_attributes
attribute float aVertexAlpha;
attribute vec2 aLightCoord;

#include declare_matrix_uniforms
#include declare_vertex_uv

uniform vec4 uTextureCoordOffsetU;
uniform vec4 uTextureCoordOffsetV;

#include source1_varying_worldvertextransition

/* worldvertextransition.vs */
void main(void) {
	#include compute_vertex_uv
	#include compute_vertex
	#include compute_vertex_skinning
	#include compute_vertex_projection
	#include compute_vertex_shadow_mapping
	#include compute_vertex_standard
	vVertexAlpha = aVertexAlpha;
}
`;
