struct MatrixUniforms {
	modelMatrix : mat4x4f,
	viewMatrix : mat4x4f,
	modelViewMatrix : mat4x4f,
	projectionMatrix : mat4x4f,
	viewProjectionMatrix : mat4x4f,
	normalMatrix : mat3x3f,
	cameraPosition: vec3f,
#if defined(HARDWARE_SKINNING) && defined(SKELETAL_MESH)
	boneMatrix: array<mat4x4f, MAX_HARDWARE_BONES>,
#endif
}

@group(0) @binding(x) var<uniform> matrixUniforms : MatrixUniforms;
