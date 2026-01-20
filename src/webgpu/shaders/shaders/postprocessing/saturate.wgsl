#include common_uniforms

@group(0) @binding(x) var colorTexture: texture_storage_2d<rgba8unorm, read>;
@group(0) @binding(x) var outTexture: texture_storage_2d<OUTPUT_FORMAT, write>;

@group(0) @binding(x) var<uniform> uSaturation: f32;

@compute @workgroup_size(1) fn compute_main(
	@builtin(global_invocation_id) id : vec3u
	)
{
	var texelColor = textureLoad(colorTexture, id.xy);

	let luminance: f32 = 0.2126 * texelColor.r + 0.7152 * texelColor.g + 0.0722 * texelColor.b;

	textureStore(outTexture, id.xy, mix(vec4(luminance), texelColor, vec4f(vec3f(uSaturation), 1.0)));
}
