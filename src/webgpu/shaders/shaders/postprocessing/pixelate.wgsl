@group(0) @binding(x) var colorTexture: texture_storage_2d<rgba8unorm, read>;
@group(0) @binding(x) var outTexture: texture_storage_2d<PRESENTATION_FORMAT, write>;
@group(0) @binding(x) var<uniform> resolution : vec4f;
@group(0) @binding(x) var<uniform> uHorizontalTiles: f32;


fn computeSquarePixel(pos: vec2u) {
	let sizef: vec2f = vec2f(resolution.xy);

	let pixelWH: vec2f = vec2(uHorizontalTiles / sizef.xy);

	let xy: vec2f = floor(vec2f(pos) / uHorizontalTiles) * pixelWH + pixelWH / 2.0;

	let uv: vec2f = (vec2f(pos) - 0.5 * sizef.xy) / sizef.y * uHorizontalTiles;

	let unit: f32 = 2.0 * uHorizontalTiles / sizef.y;

	let rep: vec2f = vec2(1.0, 1.); // 1.73 ~ sqrt(3)
	let hrep: vec2f = 0.5 * rep;
	let a: vec2f = uv % rep - hrep;
	let b: vec2f = (uv - hrep) % rep - hrep;
	let hexUv: vec2f = b;//dot(a, a) < dot(b, b) ? a : b;
	let cellId: vec2f = uv - hexUv;

	var sampleUv: vec2u = vec2u(cellId / uHorizontalTiles);
	sampleUv.x *= u32(sizef.y / sizef.x);

	var v = textureLoad(colorTexture, vec2u(xy * sizef));
	textureStore(outTexture, pos, vec4f(xy, 0.0, 1.0));
	textureStore(outTexture, pos, v);
}

#ifndef PIXEL_STYLE
	#define PIXEL_STYLE 0
#endif

@compute @workgroup_size(1) fn compute_main(
	@builtin(global_invocation_id) id : vec3u
	)
{
/*
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

*/

	let size = textureDimensions(outTexture);
	//let center = vec2f(size) / 2.0;

	// the pixel we're going to write to
	let pos = id.xy;

	#if (PIXEL_STYLE == 0)
		computeSquarePixel(pos);
	#elif (PIXEL_STYLE == 1)
		computeDiamondPixel(gl_FragColor, gl_FragCoord.xy);
	#elif (PIXEL_STYLE == 2)
		computeRoundPixel1(gl_FragColor, gl_FragCoord.xy);
	#elif (PIXEL_STYLE == 3)
		computeRoundPixel2(gl_FragColor, gl_FragCoord.xy);
	#elif (PIXEL_STYLE == 4)
		computeHexagonPixel(gl_FragColor, gl_FragCoord.xy);
	#elif (PIXEL_STYLE == 5)
		computeVoronoiPixel(gl_FragColor, gl_FragCoord.xy);
	#elif (PIXEL_STYLE == 6)
		computeTrianglePixel(gl_FragColor, gl_FragCoord.xy);
	#endif

}
