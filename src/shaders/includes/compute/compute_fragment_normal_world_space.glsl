export default `
#ifdef FLAT_SHADING
	vec3 fdx = vec3(dFdx(vVertexPositionWorldSpace.x), dFdx(vVertexPositionWorldSpace.y), dFdx(vVertexPositionWorldSpace.z));
	vec3 fdy = vec3(dFdy(vVertexPositionWorldSpace.x), dFdy(vVertexPositionWorldSpace.y), dFdy(vVertexPositionWorldSpace.z));
	vec3 fragmentNormalWorldSpace = normalize(cross(fdx, fdy));
	vec3 fragmentTangentWorldSpace = normalize(fdx);
	vec3 fragmentBitangentWorldSpace = normalize(fdy);
#else
	vec3 fragmentNormalWorldSpace = normalize(vVertexNormalWorldSpace.xyz);
	vec3 fragmentTangentWorldSpace = normalize(vVertexTangentWorldSpace.xyz);
	vec3 fragmentBitangentWorldSpace = normalize(vVertexBitangentWorldSpace.xyz);
#endif
mat3 TBNMatrixWorldSpace = mat3(fragmentTangentWorldSpace, fragmentBitangentWorldSpace, fragmentNormalWorldSpace);
`;
