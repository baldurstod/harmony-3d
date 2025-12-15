export default `
#ifdef SKELETAL_MESH
	#ifdef HARDWARE_SKINNING
		mat4 skinMat = accumulateSkinMat();
		vec4 vertexPositionWorldSpace = skinMat * vertexPositionModelSpace;
		vec3 vertexNormalWorldSpace = vec3(skinMat * vertexNormalModelSpace);
		vec3 vertexTangentWorldSpace = vec3(skinMat * vertexTangentModelSpace);
	#else
		#define vertexPositionWorldSpace vertexPositionModelSpace
		#define vertexNormalWorldSpace vertexNormalModelSpace.xyz
		#define vertexTangentWorldSpace vertexTangentModelSpace.xyz
	#endif
#else
	vec4 vertexPositionWorldSpace = uModelMatrix * vertexPositionModelSpace;
	vec3 vertexNormalWorldSpace = vec3(uModelMatrix * vertexNormalModelSpace);
	vec3 vertexTangentWorldSpace = vec3(uModelMatrix * vertexTangentModelSpace);
#endif
vVertexPositionWorldSpace = vertexPositionWorldSpace;
vVertexNormalWorldSpace = vertexNormalWorldSpace;
#ifdef TESTING
	vVertexTangentWorldSpace = vertexTangentWorldSpace;
#endif

#ifdef USE_VERTEX_TANGENT
	vec3 vertexBitangentWorldSpace = cross( vertexNormalWorldSpace, vertexTangentWorldSpace) * aVertexTangent.w;
#else
	//TODO: compute it properly
	vec3 vertexBitangentWorldSpace = cross( vertexNormalWorldSpace, vertexTangentWorldSpace) * -1.0;
#endif
#ifdef TESTING
	vVertexBitangentWorldSpace = vertexBitangentWorldSpace;
#endif
`;
