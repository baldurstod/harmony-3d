struct Uniforms {
	modelMatrix : mat4x4f,
	viewMatrix : mat4x4f,
	modelViewMatrix : mat4x4f,
	projectionMatrix : mat4x4f,
	viewProjectionMatrix : mat4x4f,
	normalMatrix : mat4x4f,
}

@group(0) @binding(0) var<uniform> uniforms : Uniforms;


struct VertexOut {
	@builtin(position) position : vec4f,
}

@vertex
fn vertex_main(@location(0) position: vec3f) -> VertexOut
{
	var output : VertexOut;
	output.position = uniforms.projectionMatrix * uniforms.viewMatrix * uniforms.modelMatrix * vec4<f32>(position, 1.0);
	//output.position = vec4<f32>(position.x, position.y, position.z, 1.0);
	return output;
}

@fragment
fn fragment_main(fragData: VertexOut) -> @location(0) vec4f
{
	//return fragData.color;
	return vec4<f32>(1.0, 1.0, 1.0, 1.0);
}
