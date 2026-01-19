#include common_uniforms

@group(0) @binding(x) var colorTexture: texture_storage_2d<rgba8unorm, read>;
@group(0) @binding(x) var outTexture: texture_storage_2d<OUTPUT_FORMAT, write>;
@group(0) @binding(x) var<uniform> uGrainIntensity: f32;

// short version of "random pixel sprites" by stb. https://shadertoy.com/view/3ttfzl ( 2371ch )
// Inspired by https://www.youtube.com/watch?v=8wOUe32Pt-E

// What power of 2 the pixel cell sizes are increased to
const pixel_scale: i32 = 1;

// https://lospec.com/palette-list/oil-6
// Should be sorted in increasing order by perceived luminance for best results
// Can work with up to 256 distinct colors
const palette = array(
vec4(39./255., 39./255., 68./255., 1.),
vec4(73./255., 77./255., 126./255., 1.),
vec4(139./255., 109./255., 156./255.,1.),
vec4(198./255., 159./255., 165./255., 1.),
vec4(242./255., 211./255., 171./255., 1.),
vec4(251./255., 245./255., 239./255., 1.));

// Amount of colors in the palette
// Changing this is not recommended
const colors: i32 = 6;//i32(arrayLength(palette));

// How much the dither effect spreads. By default it is set to decrease as the amount of colors increases.
// Set to 0 to disable the dithering effect for flat color areas.
const dither_spread: f32 = 1./f32(colors);

// Precomputed threshold map for dithering
const threshold: mat4x4f = mat4x4f(0., 8., 2., 10.,
                                12., 4., 14., 6.,
                                3.,11.,1.,9.,
                                15.,7.,13., 5.);

fn applyPalette(lum: f32) -> vec4f
{
	let l: f32 = floor(lum * f32(colors));
	return palette[i32(lum)];
}
@compute @workgroup_size(1) fn compute_main(
	@builtin(global_invocation_id) id : vec3u
	)
{
	// https://luka712.github.io/2018/07/01/Pixelate-it-Shadertoy-Unity/
	let pixelSizeX: f32 = 1.0 / commonUniforms.resolution.x;
	let pixelSizeY: f32 = 1.0 / commonUniforms.resolution.y;
	let cellSizeX: f32 = pow(2., f32(pixel_scale)) * pixelSizeX;
	let cellSizeY: f32 = pow(2., f32(pixel_scale)) * pixelSizeY;

	// Normalized pixel coordinates (from 0 to 1)
	let uv: vec2f = vec2f(id.xy) / commonUniforms.resolution.xy;

	// Convert pixel coordinates to cell coordinates
	let u: f32 = cellSizeX * floor(uv.x / cellSizeX);
	let v: f32 = cellSizeY * floor(uv.y / cellSizeY);

	// get pixel information from the cell coordinates
	var col: vec4f = textureLoad(colorTexture, id.xy);

	// https://en.wikipedia.org/wiki/Ordered_dithering
	let x: i32 = i32(u / cellSizeX) % 4;
	let y: i32 = i32(v / cellSizeY) % 4;
	col.r = col.r + (dither_spread * ((threshold[x][y]/16.) -.5));
	col.g = col.g + (dither_spread * ((threshold[x][y]/16.) -.5));
	col.b = col.b + (dither_spread * ((threshold[x][y]/16.) -.5));
	col.r = floor(col.r * f32(colors-1) + .5)/f32(colors-1);
	col.g = floor(col.g * f32(colors-1) + .5)/f32(colors-1);
	col.b = floor(col.b * f32(colors-1) + .5)/f32(colors-1);

	// Calculate luminance
	let lum: f32 = (0.299*col.r + 0.587*col.g + 0.114*col.b);

	// Apply the new color palette
	col = applyPalette(lum);

	// Output to screen
	//fragColor = vec4(col);
	if (col.r <= 0.2) {
		//fragColor.a = 0.0;
	}

	textureStore(outTexture, id.xy, col);
}
/*
{
	let grain: f32 = 1.0 - rand(vec2f(id.xy)) * uGrainIntensity;

	var v = textureLoad(colorTexture, id.xy);

	textureStore(outTexture, id.xy, v * vec4(grain, grain, grain, 1.0));
}
*/
