export default `
//#version 300 es

attribute float aParticleId;
#include declare_attributes

#include declare_matrix_uniforms

//uniform float uFaceCamera;
uniform vec3 uCameraPosition;
uniform vec2 uFinalTextureScale;

#include source_declare_particle

#include source1_declare_gamma_functions

#include source2_varying_spritecard

void main(void) {
#ifdef HARDWARE_PARTICLES
	#include source1_compute_particle_position
	vColor = p.color;
	vColor = GammaToLinear(p.color);
	vColor = p.color;

	vTextureCoord.xy = aTextureCoord * uFinalTextureScale;
#ifdef USE_TEXTURE_COORD_2
	vTexture2Coord.xy = aTextureCoord2;
#endif
#else
	#ifdef USE_VERTEX_COLOR
		vColor = aVertexColor;
	#else
		vColor = vec4(1.0);
	#endif
	#include compute_vertex_uv
	#include compute_vertex
	#include compute_vertex_skinning
	#include compute_vertex_projection
#endif



}
`;
