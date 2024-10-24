export default `
#include declare_attributes
#include declare_matrix_uniforms
#include declare_vertex_uv
#include declare_vertex_skinning

uniform vec4 g_patternTexCoordTransform[2];
uniform vec4 g_wearTexCoordTransform[2];
uniform vec4 g_grungeTexCoordTransform[2];

#include source1_varying_customweapon

void main(void) {
	#include compute_vertex_uv
	#include compute_vertex
	#include compute_vertex_skinning
	#include compute_vertex_projection
	vTextureCoord.xy = mod(vTextureCoord.xy, 1.0);

	vTextureCoord.z = dot(vTextureCoord.xy, g_patternTexCoordTransform[0].xy) + g_patternTexCoordTransform[0].w;
	vTextureCoord.w = dot(vTextureCoord.xy, g_patternTexCoordTransform[1].xy) + g_patternTexCoordTransform[1].w;
	vTexture2Coord.x = dot(aTextureCoord, g_wearTexCoordTransform[0].xy) + g_wearTexCoordTransform[0].w;
	vTexture2Coord.y = dot(aTextureCoord, g_wearTexCoordTransform[1].xy) + g_wearTexCoordTransform[1].w;
	vTexture2Coord.z = dot(aTextureCoord, g_grungeTexCoordTransform[0].xy) + g_grungeTexCoordTransform[0].w;
	vTexture2Coord.w = dot(aTextureCoord, g_grungeTexCoordTransform[1].xy) + g_grungeTexCoordTransform[1].w;
}
`;
