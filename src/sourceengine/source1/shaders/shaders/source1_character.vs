export default `
#include declare_attributes
#include declare_matrix_uniforms
#include declare_vertex_uv
#include declare_vertex_skinning

#include source1_varying_character

void main(void) {
	#include compute_vertex_uv
	#include compute_vertex
	#include compute_vertex_skinning
	#include compute_vertex_projection

	vec4 vProjPos = uViewProjectionMatrix * vertexPositionWorldSpace;
	//o.projPos = vProjPos;
	vProjPos.z = dot(vertexPositionWorldSpace, uViewProjectionMatrix[2] );
	//worldPos_projPosZ = vec4(vertexPositionWorldSpace.xyz, vProjPos.z );
}
`;
