struct MatrixUniforms {
	modelMatrix : mat4x4f,
	viewMatrix : mat4x4f,
	modelViewMatrix : mat4x4f,
	projectionMatrix : mat4x4f,
	viewProjectionMatrix : mat4x4f,
	normalMatrix : mat3x3f,
}

@group(0) @binding(0) var<uniform> matrixUniforms : MatrixUniforms;
