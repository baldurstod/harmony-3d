export default `
vec4 vertexPositionModelSpace = vec4(aVertexPosition, 1.0);
#ifdef REVERSE_CULLING
	vec4 vertexNormalModelSpace = vec4(-aVertexNormal, 0.0);
#else
	vec4 vertexNormalModelSpace = vec4(aVertexNormal, 0.0);
#endif

#ifdef USE_VERTEX_TANGENT
	vec4 vertexTangentModelSpace = vec4(aVertexTangent.xyz, 0.0);
#else
	//TODO: compute it properly
	vec4 vertexTangentModelSpace = vec4(0.0, 1.0, 0.0, 0.0);
#endif

vVertexNormalModelSpace = vertexNormalModelSpace;
vVertexTangentModelSpace = vertexTangentModelSpace;
`;
