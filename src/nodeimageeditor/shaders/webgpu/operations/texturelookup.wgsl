#include matrix_uniforms
#include common_uniforms

#include nodeimageeditor_declare_functions

@group(0) @binding(x) var inputTexture: texture_2d<f32>;
@group(0) @binding(x) var inputSampler: sampler;

@group(0) @binding(x) var outTexture: texture_storage_2d<rgba8unorm, write>;

@group(0) @binding(x) var<uniform> adjustLevels: vec4f;
#define g_AdjustInBlack		adjustLevels.x
#define g_AdjustInWhite		adjustLevels.y
#define g_AdjustGamma		adjustLevels.z

#ifdef TRANSFORM_TEX_COORD
	@group(0) @binding(x) var<uniform> transformTexCoord0: mat3x3f;
#endif

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
	var color: vec4f = textureSample(inputTexture, inputSampler, vec3(transformTexCoord0 * vec3(fragInput.vTextureCoord, 1.0)).xy);
	color = AdjustLevels(color, g_AdjustInBlack, g_AdjustInWhite, g_AdjustGamma);

	textureStore(outTexture, vec2<u32>(fragInput.vTextureCoord * commonUniforms.resolution.xy), color);
	return FragmentOutput(vec4(1.0));
}
