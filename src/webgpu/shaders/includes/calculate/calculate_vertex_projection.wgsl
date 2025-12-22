#ifdef SKIP_PROJECTION
	output.position = vec4(position, 1.0);
#else
	let vertexPositionCameraSpace: vec4f = matrixUniforms.viewMatrix * vertexPositionWorldSpace;//TODOv3: use projectionview matrix instead ?
	let vertexNormalCameraSpace: vec3f = matrixUniforms.normalMatrix * vertexNormalWorldSpace;//TODOv3: use projectionview matrix instead ?
	let vertexTangentCameraSpace: vec3f = matrixUniforms.normalMatrix * vertexTangentWorldSpace;//TODOv3: use projectionview matrix instead ?
	let vertexBitangentCameraSpace: vec3f = matrixUniforms.normalMatrix * vertexBitangentWorldSpace;//TODOv3: use projectionview matrix instead ?
	output.position = matrixUniforms.projectionMatrix * vertexPositionCameraSpace;

	output.vVertexPositionCameraSpace = vertexPositionCameraSpace;
	output.vVertexNormalCameraSpace = vertexNormalCameraSpace;
	output.vVertexTangentCameraSpace = vertexTangentCameraSpace;
	output.vVertexBitangentCameraSpace = vertexBitangentCameraSpace;
#endif
