export default `
#ifdef FLAT_SHADING
	vec3 fdx = dFdx(vVertexPositionCameraSpace).xyz;
	vec3 fdy = dFdy(vVertexPositionCameraSpace).xyz;
	vec3 fragmentNormalCameraSpace = normalize(cross(fdx, fdy));
	vec3 fragmentTangentCameraSpace = normalize(fdx);
	vec3 fragmentBitangentCameraSpace = normalize(fdy);
#else
	vec3 fragmentNormalCameraSpace = normalize(vVertexNormalCameraSpace.xyz);
	vec3 fragmentTangentCameraSpace = normalize(vVertexTangentCameraSpace.xyz);
	vec3 fragmentBitangentCameraSpace = normalize(vVertexBitangentCameraSpace.xyz);
#endif
mat3 TBNMatrixCameraSpace = mat3(fragmentTangentCameraSpace, fragmentBitangentCameraSpace, fragmentNormalCameraSpace);
`;
