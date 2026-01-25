//#define INPUT_COUNT 8

#include matrix_uniforms
#include common_uniforms

// Note: at the time of writing, texture arrays does not exist in webgpu
#if INPUT_COUNT > 0
	@group(0) @binding(x) var inputTexture0: texture_storage_2d<rgba8unorm, read>;
#endif
#if INPUT_COUNT > 1
	@group(0) @binding(x) var inputTexture1: texture_storage_2d<rgba8unorm, read>;
#endif
#if INPUT_COUNT > 2
	@group(0) @binding(x) var inputTexture2: texture_storage_2d<rgba8unorm, read>;
#endif
#if INPUT_COUNT > 3
	@group(0) @binding(x) var inputTexture3: texture_storage_2d<rgba8unorm, read>;
#endif
#if INPUT_COUNT > 4
	@group(0) @binding(x) var inputTexture4: texture_storage_2d<rgba8unorm, read>;
#endif
#if INPUT_COUNT > 5
	@group(0) @binding(x) var inputTexture5: texture_storage_2d<rgba8unorm, read>;
#endif
#if INPUT_COUNT > 6
	@group(0) @binding(x) var inputTexture6: texture_storage_2d<rgba8unorm, read>;
#endif
#if INPUT_COUNT > 7
	@group(0) @binding(x) var inputTexture7: texture_storage_2d<rgba8unorm, read>;
#endif

@group(0) @binding(x) var outTexture: texture_storage_2d<rgba8unorm, write>;
//@group(0) @binding(x) var<uniform> used: array<i32, INPUT_COUNT>;

@compute @workgroup_size(1) fn compute_main(
	@builtin(global_invocation_id) id : vec3u
	)
{
	var out: vec4f = vec4(1.0);
	for (var i: i32 = 0; i < INPUT_COUNT; i++) {
		//if (used[i] > 0)
		{
			switch i {
#if INPUT_COUNT > 0
				case 0: {
					out *= textureLoad(inputTexture0, id.xy);
				}
#endif
#if INPUT_COUNT > 1
				case 1: {
					out *= textureLoad(inputTexture1, id.xy);
				}
#endif
#if INPUT_COUNT > 2
				case 2: {
					out *= textureLoad(inputTexture2, id.xy);
				}
#endif
#if INPUT_COUNT > 3
				case 3: {
					out *= textureLoad(inputTexture3, id.xy);
				}
#endif
#if INPUT_COUNT > 4
				case 4: {
					out *= textureLoad(inputTexture4, id.xy);
				}
#endif
#if INPUT_COUNT > 5
				case 5: {
					out *= textureLoad(inputTexture5, id.xy);
				}
#endif
#if INPUT_COUNT > 6
				case 6: {
					out *= textureLoad(inputTexture6, id.xy);
				}
#endif
#if INPUT_COUNT > 7
				case 7: {
					out *= textureLoad(inputTexture7, id.xy);
				}
#endif
				default: {
				}
			}
		}
	}

	textureStore(outTexture, id.xy, out);
}
