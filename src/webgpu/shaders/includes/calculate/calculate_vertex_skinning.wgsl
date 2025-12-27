#ifdef SKELETAL_MESH
	#ifdef HARDWARE_SKINNING
		let skinMat: mat4x4f = accumulateSkinMat(boneWeights, boneIndices);
		let vertexPositionWorldSpace: vec4f = skinMat * vertexPositionModelSpace;
		let vertexNormalWorldSpace: vec3f = (skinMat * vertexNormalModelSpace).xyz;
		let vertexTangentWorldSpace: vec3f = (skinMat * vertexTangentModelSpace).xyz;
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
	let vertexBitangentWorldSpace: vec3f = cross( vertexNormalWorldSpace, vertexTangentWorldSpace) * tangent.w;
#else
	//TODO: compute it properly
	let vertexBitangentWorldSpace: vec3f = cross( vertexNormalWorldSpace, vertexTangentWorldSpace) * -1.0;
#endif
#ifdef TESTING
	output.vVertexBitangentWorldSpace = vertexBitangentWorldSpace;
#endif
