export default `
#include declare_attributes
#include declare_matrix_uniforms
#include declare_camera_position
#include declare_vertex_uv
#include declare_vertex_skinning

uniform vec3 uEyeOrigin;
uniform vec4 uIrisProjectionU;
uniform vec4 uIrisProjectionV;

/********************************************/
varying vec4 vWorldPosition_ProjPosZ;
varying vec4 vTangentViewVector;
varying vec3 vWorldNormal;
varying vec3 vWorldTangent;
varying vec3 vWorldBinormal;



vec3 Vec3WorldToTangent( vec3 iWorldVector, vec3 iWorldNormal, vec3 iWorldTangent, vec3 iWorldBinormal )
{
	vec3 vTangentVector;
	vTangentVector.x = dot( iWorldVector.xyz, iWorldTangent.xyz );
	vTangentVector.y = dot( iWorldVector.xyz, iWorldBinormal.xyz );
	vTangentVector.z = dot( iWorldVector.xyz, iWorldNormal.xyz );
	return vTangentVector.xyz; // Return without normalizing
}
vec3 Vec3WorldToTangentNormalized( vec3 iWorldVector, vec3 iWorldNormal, vec3 iWorldTangent, vec3 iWorldBinormal )
{
	return normalize( Vec3WorldToTangent( iWorldVector, iWorldNormal, iWorldTangent, iWorldBinormal ) );
}
//const vec4 g_vIrisProjectionU = vec4(0, 1, 0, 0);
//const vec4 g_vIrisProjectionV = vec4(0, 0, 1, 0);

/********************************************/

#include source1_varying_eyerefract

void main(void) {
	#include compute_vertex_uv
	#include compute_vertex
	#include compute_vertex_skinning
	#include compute_vertex_projection


/********************************************/
	vWorldPosition_ProjPosZ.xyz = vertexPositionWorldSpace.xyz;

	mat4 cViewProj = uProjectionMatrix * uViewMatrix;
	vec4 vProjPos = cViewProj * vertexPositionWorldSpace;//mul( vec4( vertexPositionWorldSpace, 1.0 ), cViewProj );
	//o.projPos = vProjPos;
	//vProjPos.z = dot(vertexPositionWorldSpace, cViewProjZ );
	//o.vWorldPosition_ProjPosZ.w = vProjPos.z;

	vec3 vEyeSocketUpVector = normalize( -uIrisProjectionV.xyz );
	vec3 vEyeSocketLeftVector = normalize( -uIrisProjectionU.xyz );

	//vEyeSocketUpVector = -vec3(0.0, 1.0, 0.0);
	//vEyeSocketLeftVector = -vec3(0.0, 0.0, 1.0);

	vWorldNormal = normalize( vertexPositionWorldSpace.xyz - uEyeOrigin.xyz );
	vWorldTangent = normalize( cross( vEyeSocketUpVector.xyz, vWorldNormal.xyz ) );
	vWorldBinormal = normalize( cross( vWorldNormal.xyz, vWorldTangent.xyz ) );

	vec3 vWorldViewVector = normalize (vertexPositionWorldSpace.xyz - uCameraPosition);
	vTangentViewVector.xyz = Vec3WorldToTangentNormalized(vWorldViewVector, vWorldNormal, vWorldTangent, vWorldBinormal);
	//vTangentViewVector.xyz = vWorldViewVector;
	//vTangentViewVector.xyz = vertexPositionWorldSpace.xyz;
	//vTangentViewVector.xyz = vWorldBinormal;

/********************************************/
}
`;
