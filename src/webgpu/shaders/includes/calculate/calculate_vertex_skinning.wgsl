#ifdef SKELETAL_MESH
	#ifdef HARDWARE_SKINNING
		mat4 skinMat = accumulateSkinMat();
		vec4 vertexPositionWorldSpace = skinMat * vertexPositionModelSpace;
		vec3 vertexNormalWorldSpace = vec3(skinMat * vertexNormalModelSpace).xyz;
		vec3 vertexTangentWorldSpace = vec3(skinMat * vertexTangentModelSpace).xyz;
	#else
		#define vertexPositionWorldSpace vertexPositionModelSpace
		#define vertexNormalWorldSpace vertexNormalModelSpace.xyz
		#define vertexTangentWorldSpace vertexTangentModelSpace.xyz
	#endif
#else
	let vertexPositionWorldSpace: vec4f = matrixUniforms.modelMatrix * vertexPositionModelSpace;
	let vertexNormalWorldSpace: vec3f = vec4(matrixUniforms.modelMatrix * vertexNormalModelSpace).xyz;
	let vertexTangentWorldSpace: vec3f = vec4(matrixUniforms.modelMatrix * vertexTangentModelSpace).xyz;
#endif
output.vVertexPositionWorldSpace = vertexPositionWorldSpace;
output.vVertexNormalWorldSpace = vertexNormalWorldSpace;
#ifdef TESTING
	output.vVertexTangentWorldSpace = vertexTangentWorldSpace;
#endif

#ifdef USE_VERTEX_TANGENT
	let vertexBitangentWorldSpace: vec3f = cross( vertexNormalWorldSpace, vertexTangentWorldSpace) * aVertexTangent.w;
#else
	//TODO: compute it properly
	let vertexBitangentWorldSpace: vec3f = cross( vertexNormalWorldSpace, vertexTangentWorldSpace) * -1.0;
#endif
#ifdef TESTING
	output.vVertexBitangentWorldSpace = vertexBitangentWorldSpace;
#endif
