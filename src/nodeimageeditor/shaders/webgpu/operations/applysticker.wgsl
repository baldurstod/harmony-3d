#include matrix_uniforms
#include common_uniforms

@group(0) @binding(x) var inputTexture: texture_2d<f32>;
@group(0) @binding(x) var inputSampler: sampler;
@group(0) @binding(x) var stickerTexture: texture_2d<f32>;
@group(0) @binding(x) var stickerSampler: sampler;
#ifdef USE_STICKER_SPECULAR
	@group(0) @binding(x) var stickerSpecularTexture: texture_2d<f32>;
	@group(0) @binding(x) var stickerSpecularSampler: sampler;
#endif

@group(0) @binding(x) var outTexture: texture_storage_2d<rgba8unorm, write>;

#ifdef TRANSFORM_TEX_COORD
	@group(0) @binding(x) var<uniform> transformTexCoord0: mat3x3f;
#endif

struct VertexOut {
	@builtin(position) position : vec4f,
	@location(y) vTextureCoord: vec4f,
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
	return VertexOut(vec4(position, 1.0), vec4f(texCoord.xy, vec3(transformTexCoord0 * vec3(texCoord.xy, 1.0)).xy));
}

@fragment
fn fragment_main(fragInput: VertexOut) -> FragmentOutput
{

	let inputColor: vec4f = textureSample(inputTexture, inputSampler, fragInput.vTextureCoord.xy);
	let stickerColor: vec4f = textureSample(stickerTexture, stickerSampler, fragInput.vTextureCoord.zw);
#ifdef USE_STICKER_SPECULAR
	let specularColor: vec4f = textureSample(stickerSpecularTexture, stickerSpecularSampler, fragInput.vTextureCoord.zw);
#else
	let specularColor: vec4f = vec4(1.);
#endif
	let color: vec4f = vec4((1.0 - stickerColor.a) * inputColor.xyz + stickerColor.a * stickerColor.xyz,
						(1.0 - stickerColor.a) * inputColor.a + stickerColor.a * specularColor.r);

	textureStore(outTexture, vec2<u32>(fragInput.vTextureCoord.xy * commonUniforms.resolution.xy), color);
	return FragmentOutput(vec4(1.0));
}
