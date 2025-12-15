#ifdef SKIP_PROJECTION
	output.position = vec4(position, 1.0);
#else
	let vertexPositionCameraSpace: vec4f = uniforms.viewMatrix * vertexPositionWorldSpace;//TODOv3: use projectionview matrix instead ?
	let vertexNormalCameraSpace: vec3f = uniforms.normalMatrix * vertexNormalWorldSpace;//TODOv3: use projectionview matrix instead ?
	let vertexTangentCameraSpace: vec3f = uniforms.normalMatrix * vertexTangentWorldSpace;//TODOv3: use projectionview matrix instead ?
	let vertexBitangentCameraSpace: vec3f = uniforms.normalMatrix * vertexBitangentWorldSpace;//TODOv3: use projectionview matrix instead ?
	output.position = uniforms.projectionMatrix * vertexPositionCameraSpace;

	output.vVertexPositionCameraSpace = vertexPositionCameraSpace;
	output.vVertexNormalCameraSpace = vertexNormalCameraSpace;
	output.vVertexTangentCameraSpace = vertexTangentCameraSpace;
	output.vVertexBitangentCameraSpace = vertexBitangentCameraSpace;
#endif
