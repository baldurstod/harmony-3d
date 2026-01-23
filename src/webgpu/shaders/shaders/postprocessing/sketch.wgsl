#include common_uniforms

const pi = 3.14159265359;
const tau: f32 = pi * 2.0;
const mSize = 9;

@group(0) @binding(x) var colorTexture: texture_storage_2d<rgba8unorm, read>;
@group(0) @binding(x) var outTexture: texture_storage_2d<OUTPUT_FORMAT, write>;

// Gaussian PDF
fn normpdf(x: f32, sigma: f32) -> f32 {
	return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}

//
fn colorDodge(src: vec3f, dst: vec3f) -> vec3f {
	return step(vec3(0.0), dst) * mix(min(vec3(1.0), dst/ (1.0 - src)), vec3(1.0), step(vec3(1.0), src));
}

fn greyScale(col: vec3f) -> f32 {
	return dot(col, vec3(0.3, 0.59, 0.11));
	//return dot(col, vec3(0.2126, 0.7152, 0.0722)); //sRGB
}

fn random(p: vec2f) -> vec2f {
	var p2: vec2f = fract(p * (vec2(314.159, 314.265)));
	p2 += dot(p2, p2.yx + 17.17);
	return fract((p2.xx + p2.yx) * p2.xy);
}

fn random2(p: vec2f) -> vec2f {
	return textureLoad(colorTexture, vec2<u32>(p / vec2(1024.0))).xy;
	//blue1 = texture(iChannel1, p / vec2(1024.0));
	//blue2 = texture(iChannel1, (p+vec2(137.0, 189.0)) / vec2(1024.0));
}

@compute @workgroup_size(1) fn compute_main(
	@builtin(global_invocation_id) id : vec3u
	)
{
	let q: vec2f = vec2f(id.xy);
	let col: vec3f = textureLoad(colorTexture, id.xy).rgb;

	var r: vec2f = random(q);
	r.x *= tau;
	let cr: vec2f = vec2(sin(r.x),cos(r.x))*sqrt(r.y);

	let blurred: vec3f = textureLoad(colorTexture, vec2<i32>(q + cr * (vec2(mSize)) )).rgb;

	// comparison
	/*
	if (false) {
		blurred = vec3f(0.0);
		var Z: f32 = 0.0;
		for (var j: i32 = 0; j <= kSize; j++) {
			kernel[kSize-j] = normpdf(float(j), sigma);
			kernel[kSize+j] = kernel[kSize-j];
		}
		for (var j: i32 = 0; j < mSize; j++) {
			Z += kernel[j];
		}

		// this can be done in two passes
		for (var i: i32 = -kSize; i <= kSize; i++) {
			for (var j: i32 = -kSize; j <= kSize; j++) {
				blurred += kernel[kSize+j]*kernel[kSize+i]*texture(colorMap, (gl_FragCoord.xy+vec2(float(i),float(j))) / commonUniforms.resolution).rgb;
			}
		}
   		blurred = blurred / Z / Z;

		// an interesting ink effect
		//r = random2(q);
		//vec2 cr = vec2(sin(r.x),cos(r.x))*sqrt(-2.0*r.y);
		//blurred = texture(iChannel0, q + cr * (vec2(mSize) / commonUniforms.resolution) ).rgb;
	}
	*/

	let inv: vec3f = vec3(1.0) - blurred;
	// color dodge
	let lighten: vec3f = colorDodge(col, inv);
	// grey scale
	var res: vec3f = vec3(greyScale(lighten));

	// more contrast
	res = vec3(pow(res.x, 3.0));
	//res = clamp(res * 0.7 + 0.3 * res * res * 1.2, 0.0, 1.0);

	// edge effect
	//if (iMouse.z > 0.5) res *= 0.25 + 0.75 * pow( 16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.15 );
	//gl_FragColor = vec4(res, 1.0);



	textureStore(outTexture, id.xy, vec4(res, 1.0));
}
