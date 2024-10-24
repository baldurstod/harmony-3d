export default `
#include declare_attributes
#include declare_matrix_uniforms
#include declare_vertex_uv
#include declare_vertex_skinning

uniform vec4 g_patternTexCoordTransform[2];
uniform vec4 g_wearTexCoordTransform[2];
uniform vec4 g_grungeTexCoordTransform[2];

#include source1_varying_weapondecal

void main(void) {
	#include compute_vertex_uv
	#include compute_vertex
	#include compute_vertex_skinning
	#include compute_vertex_projection


	vTextureCoord.z = dot(aTextureCoord, g_patternTexCoordTransform[0].xy) + g_patternTexCoordTransform[0].w;
	vTextureCoord.w = dot(aTextureCoord, g_patternTexCoordTransform[1].xy) + g_patternTexCoordTransform[1].w;


	#if (MIRROR == 0)
		vTextureCoord.z = dot(aTextureCoord, g_patternTexCoordTransform[0].xy) + g_patternTexCoordTransform[0].w;
		vTextureCoord.w = dot(aTextureCoord, g_patternTexCoordTransform[1].xy) + g_patternTexCoordTransform[1].w;
	#else
		float2 flippedTexCoord = float2( 1.0f - aTextureCoord.x, aTextureCoord.y );
		vTextureCoord.z = dot(flippedTexCoord, g_patternTexCoordTransform[0].xy) + g_patternTexCoordTransform[0].w;
		vTextureCoord.w = dot(flippedTexCoord, g_patternTexCoordTransform[1].xy) + g_patternTexCoordTransform[1].w;
	#endif

}
`;
