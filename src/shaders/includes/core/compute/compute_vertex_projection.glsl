export default `
#ifdef SKIP_PROJECTION
	gl_Position = vec4(aVertexPosition, 1.0);
#else
	vec4 vertexPositionCameraSpace = uViewMatrix * vertexPositionWorldSpace;//TODOv3: use projectionview matrix instead ?
	vec3 vertexNormalCameraSpace = uNormalMatrix * vertexNormalWorldSpace;//TODOv3: use projectionview matrix instead ?
	vec3 vertexTangentCameraSpace = uNormalMatrix * vertexTangentWorldSpace;//TODOv3: use projectionview matrix instead ?
	vec3 vertexBitangentCameraSpace = uNormalMatrix * vertexBitangentWorldSpace;//TODOv3: use projectionview matrix instead ?
	gl_Position = uProjectionMatrix * vertexPositionCameraSpace;

	vVertexPositionCameraSpace = vertexPositionCameraSpace;
	vVertexNormalCameraSpace = vertexNormalCameraSpace;
	vVertexTangentCameraSpace = vertexTangentCameraSpace;
	vVertexBitangentCameraSpace = vertexBitangentCameraSpace;
#endif
`;
