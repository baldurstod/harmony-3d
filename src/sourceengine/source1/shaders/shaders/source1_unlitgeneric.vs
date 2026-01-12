export default `
//#version 300 es

attribute float aParticleId;
#include declare_attributes
#include declare_matrix_uniforms
#include declare_vertex_uv
#include declare_vertex_skinning

uniform float uFaceCamera;
uniform vec3 uCameraPosition;

#include source_declare_particle
#include source1_declare_gamma_functions

#include source1_varying_unlit_generic

void main(void) {
#ifdef HARDWARE_PARTICLES
	#define SOURCE1_PARTICLES
	#include source1_compute_particle_position
	#ifdef ADDITIVE
		vColor = GammaToLinear(p.color);
	#else
		vColor = p.color;
	#endif
#else
	#ifdef USE_VERTEX_COLOR
		vColor = aVertexColor;
	#endif
	#include compute_vertex_uv
	#include compute_vertex
	#include compute_vertex_skinning
	#include compute_vertex_projection
#endif
}
`;
