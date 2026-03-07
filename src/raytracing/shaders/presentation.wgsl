@group(0) @binding(x) var inTexture: texture_2d<f32>;
@group(0) @binding(x) var inSampler: sampler;

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
	let color1: vec4f = textureSample(inTexture, inSampler, vec2f(fragInput.vTextureCoord.x, 1.0 - fragInput.vTextureCoord.y));
	return FragmentOutput(color1);
}
