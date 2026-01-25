//#define INPUT_COUNT 8

#include matrix_uniforms
#include common_uniforms

@group(0) @binding(x) var input0: texture_storage_2d<rgba8unorm, read>;
@group(0) @binding(x) var input1: texture_storage_2d<rgba8unorm, read>;
@group(0) @binding(x) var inputWeight: texture_storage_2d<rgba8unorm, read>;
@group(0) @binding(x) var outTexture: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(1) fn compute_main(
	@builtin(global_invocation_id) id : vec3u
	)
{
	let color1: vec4f = textureLoad(input0, id.xy);
	let color2: vec4f = textureLoad(input1, id.xy);
	let color3: vec4f = textureLoad(inputWeight, id.xy);

	textureStore(outTexture, id.xy, mix(color1, color2, color3.rrrr));
}
