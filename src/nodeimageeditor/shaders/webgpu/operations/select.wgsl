#include matrix_uniforms
#include common_uniforms

@group(0) @binding(x) var inputTexture: texture_storage_2d<rgba8unorm, read>;
@group(0) @binding(x) var outTexture: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(x) var<uniform> select: array<f32, MAX_SELECTORS>;

@compute @workgroup_size(1) fn compute_main(
	@builtin(global_invocation_id) id : vec3u
	)
{
	let color: vec4f = textureLoad(inputTexture, id.xy);

	var out: vec4f = vec4(0.0);
	for (var i: i32 = 0; i < MAX_SELECTORS; i++) {
		if (select[i] > 0.0) {
			if (abs(color.r * 255.0 - select[i]) < 8.0) {
				out = vec4(1.0);
			}
		}
	}

	textureStore(outTexture, id.xy, out);
}
