/*
#define USE_COLOR_MAP// why ?

#include declare_fragment_standard
//#include declare_fragment_color_map
@group(0) @binding(x) var colorTexture: texture_storage_2d<PRESENTATION_FORMAT, write>;

#include postprocessing_vertex

@fragment
fn fragment_main(fragInput: VertexOut) -> FragmentOutput
{
	var fragColor: vec4f;
	var fragDepth: f32;

	fragColor = vec4(1.0);
	fragColor = textureSample(colorTexture, colorSampler, fragInput.vTextureCoord.xy);

	#include output_fragment
}
*/


@group(0) @binding(x) var colorTexture: texture_storage_2d<rgba8unorm, read>;
@group(0) @binding(x) var outTexture: texture_storage_2d<PRESENTATION_FORMAT, write>;

@compute @workgroup_size(1) fn compute_main(
	@builtin(global_invocation_id) id : vec3u
	)  {
	let size = textureDimensions(outTexture);
	let center = vec2f(size) / 2.0;

	// the pixel we're going to write to
	let pos = id.xy;

	// The distance from the center of the texture
	let dist = distance(vec2f(pos), center);

	// Compute stripes based on the distance
	let stripe = dist / 32.0 % 2.0;
	let red = vec4f(1, 0, 0, 1);
	let cyan = vec4f(0, 1, 1, 1);
	let color = select(red, cyan, stripe < 1.0);

	// Write the color to the texture
	var v = textureLoad(colorTexture, pos);
	textureStore(outTexture, pos, color);
}
