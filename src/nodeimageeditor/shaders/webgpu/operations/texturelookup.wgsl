#include matrix_uniforms
#include common_uniforms

@group(0) @binding(x) var inputTexture: texture_2d<f32>;
@group(0) @binding(x) var inputSampler: sampler;

@group(0) @binding(x) var outTexture: texture_storage_2d<rgba8unorm, write>;

struct VertexOut {
	@builtin(position) position : vec4f,
	@location(y) vTextureCoord: vec2f,
}

struct FragmentOutput {
	@location(0) color: vec4<f32>,
};

@vertex
fn vertex_main(
	@location(x) position: vec3f,
	@location(x) texCoord: vec2f,
) -> VertexOut
{
	return VertexOut(vec4(position, 1.0), texCoord.xy);
}

@fragment
fn fragment_main(fragInput: VertexOut) -> FragmentOutput
{
	textureStore(outTexture, vec2<u32>(fragInput.vTextureCoord * commonUniforms.resolution.xy), textureSample(inputTexture, inputSampler, fragInput.vTextureCoord));
	return FragmentOutput(vec4(1.0));
}
