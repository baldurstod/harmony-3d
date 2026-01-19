#include common_uniforms

@group(0) @binding(x) var colorTexture: texture_storage_2d<rgba8unorm, read>;
@group(0) @binding(x) var outTexture: texture_storage_2d<OUTPUT_FORMAT, write>;

@group(0) @binding(x) var<uniform> uGrainIntensity: f32;

fn rand(co: vec2f) -> f32 {
	const a: f32 = 12.9898;
	const b: f32 = 78.233;
	const c: f32 = 43758.5453;
	let dt: f32 = dot(co.xy ,vec2(a,b));
	let sn: f32 = dt % 3.14;
	return fract(sin(sn) * c);
}

@compute @workgroup_size(1) fn compute_main(
	@builtin(global_invocation_id) id : vec3u
	)
{

	let grain: f32 = 1.0 - rand(vec2f(id.xy)) * uGrainIntensity;

	var v = textureLoad(colorTexture, id.xy);

	textureStore(outTexture, id.xy, v * vec4(grain, grain, grain, 1.0));
}
