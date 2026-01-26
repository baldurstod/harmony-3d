//#define INPUT_COUNT 8

#include matrix_uniforms
#include common_uniforms

// Note: at the time of writing, texture arrays does not exist in webgpu
#if INPUT_COUNT > 0
	@group(0) @binding(x) var input0Texture: texture_2d<f32>;
	@group(0) @binding(x) var input0Sampler: sampler;
#endif
#if INPUT_COUNT > 1
	@group(0) @binding(x) var input1Texture: texture_2d<f32>;
	@group(0) @binding(x) var input1Sampler: sampler;
#endif
#if INPUT_COUNT > 2
	@group(0) @binding(x) var input2Texture: texture_2d<f32>;
	@group(0) @binding(x) var input2Sampler: sampler;
#endif
#if INPUT_COUNT > 3
	@group(0) @binding(x) var input3Texture: texture_2d<f32>;
	@group(0) @binding(x) var input3Sampler: sampler;
#endif
#if INPUT_COUNT > 4
	@group(0) @binding(x) var input4Texture: texture_2d<f32>;
	@group(0) @binding(x) var input4Sampler: sampler;
#endif
#if INPUT_COUNT > 5
	@group(0) @binding(x) var input5Texture: texture_2d<f32>;
	@group(0) @binding(x) var input5Sampler: sampler;
#endif
#if INPUT_COUNT > 6
	@group(0) @binding(x) var input6Texture: texture_2d<f32>;
	@group(0) @binding(x) var input6Sampler: sampler;
#endif
#if INPUT_COUNT > 7
	@group(0) @binding(x) var input7Texture: texture_2d<f32>;
	@group(0) @binding(x) var input7Sampler: sampler;
#endif

@group(0) @binding(x) var outTexture: texture_storage_2d<rgba8unorm, write>;
//@group(0) @binding(x) var<uniform> used: array<i32, INPUT_COUNT>;

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

	var out: vec4f = vec4(1.0);
	for (var i: i32 = 0; i < INPUT_COUNT; i++) {
		//if (used[i] > 0)
		{
			switch i {
#if INPUT_COUNT > 0
				case 0: {
					out *= textureSample(input0Texture, input0Sampler, fragInput.vTextureCoord);
				}
#endif
#if INPUT_COUNT > 1
				case 1: {
					out *= textureSample(input1Texture, input1Sampler, fragInput.vTextureCoord);
				}
#endif
#if INPUT_COUNT > 2
				case 2: {
					out *= textureSample(input2Texture, input2Sampler, fragInput.vTextureCoord);
				}
#endif
#if INPUT_COUNT > 3
				case 3: {
					out *= textureSample(input3Texture, input3Sampler, fragInput.vTextureCoord);
				}
#endif
#if INPUT_COUNT > 4
				case 4: {
					out *= textureSample(input4Texture, input4Sampler, fragInput.vTextureCoord);
				}
#endif
#if INPUT_COUNT > 5
				case 5: {
					out *= textureSample(input5Texture, input5Sampler, fragInput.vTextureCoord);
				}
#endif
#if INPUT_COUNT > 6
				case 6: {
					out *= textureSample(input6Texture, input6Sampler, fragInput.vTextureCoord);
				}
#endif
#if INPUT_COUNT > 7
				case 7: {
					out *= textureSample(input7Texture, input7Sampler, fragInput.vTextureCoord);
				}
#endif
				default: {
				}
			}
		}
	}

	textureStore(outTexture, vec2<u32>(fragInput.vTextureCoord * commonUniforms.resolution.xy), out);
	return FragmentOutput(vec4(1.0));
}
