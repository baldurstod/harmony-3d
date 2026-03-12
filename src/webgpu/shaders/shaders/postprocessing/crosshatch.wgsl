#include common_uniforms
#include math::modulo

@group(0) @binding(x) var colorTexture: texture_storage_2d<rgba8unorm, read>;
@group(0) @binding(x) var outTexture: texture_storage_2d<OUTPUT_FORMAT, write>;

@compute @workgroup_size(1) fn compute_main(
	@builtin(global_invocation_id) id : vec3u
	)
{
	let lum: f32 = length(textureLoad(colorTexture, id.xy).rgb);

	var fragColor: vec4f = vec4(1.0);

	if (lum < 1.00) {
		if (modulo_f32(f32(id.x) + f32(id.y), 10.0) == 0.0) {
			fragColor = vec4(0.0, 0.0, 0.0, 1.0);
		}
	}

	if (lum < 0.75) {
		if (modulo_f32(f32(id.x) - f32(id.y), 10.0) == 0.0) {
			fragColor = vec4(0.0, 0.0, 0.0, 1.0);
		}
	}

	if (lum < 0.50) {
		if (modulo_f32(f32(id.x) + f32(id.y) - 5.0, 10.0) == 0.0) {
			fragColor = vec4(0.0, 0.0, 0.0, 1.0);
		}
	}

	if (lum < 0.3) {
		if (modulo_f32(f32(id.x) - f32(id.y) - 5.0, 10.0) == 0.0) {
			fragColor = vec4(0.0, 0.0, 0.0, 1.0);
		}
	}

	textureStore(outTexture, id.xy, fragColor);
}
