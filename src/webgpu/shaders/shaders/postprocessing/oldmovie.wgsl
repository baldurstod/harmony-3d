#include common_uniforms

const pi = 3.14159265359;
const tau: f32 = pi * 2.0;

@group(0) @binding(x) var colorTexture: texture_storage_2d<rgba8unorm, read>;
@group(0) @binding(x) var outTexture: texture_storage_2d<OUTPUT_FORMAT, write>;

fn mod289Vec3(x: vec3f) -> vec3f{
	return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn mod289Vec2(x: vec2f) -> vec2f {
	return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn permute(x: vec3f) -> vec3f {
	return mod289Vec3(((x*34.0)+10.0)*x);
}

fn snoise(v: vec2f) -> f32 {
	const C: vec4f = vec4(0.211324865405187,	// (3.0-sqrt(3.0))/6.0
						0.366025403784439,	// 0.5*(sqrt(3.0)-1.0)
					 -0.577350269189626,	// -1.0 + 2.0 * C.x
						0.024390243902439); // 1.0 / 41.0
// First corner
	var i: vec2f = floor(v + dot(v, C.yy) );
	let x0: vec2f = v -	 i + dot(i, C.xx);

// Other corners
	var i1: vec2f;
	//i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
	//i1.y = 1.0 - i1.x;
	i1 = select(vec2(0.0, 1.0), vec2(1.0, 0.0), (x0.x > x0.y));//i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
	// x0 = x0 - 0.0 + 0.0 * C.xx ;
	// x1 = x0 - i1 + 1.0 * C.xx ;
	// x2 = x0 - 1.0 + 2.0 * C.xx ;
	var x12: vec4f = x0.xyxy + C.xxzz;
	x12 -= vec4f(x12.xy - i1, x12.zw);

// Permutations
	i = mod289Vec2(i); // Avoid truncation effects in permutation
	let p: vec3f = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

	var m: vec3f = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), vec3(0.0));
	m = m*m ;
	m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

	let x: vec3f = 2.0 * fract(p * C.www) - 1.0;
	let h: vec3f = abs(x) - 0.5;
	let ox: vec3f = floor(x + 0.5);
	let a0: vec3f = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
	m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
	let g: vec3f = vec3(a0.x	* x0.x	+ h.x	* x0.y, a0.yz * x12.xz + h.yz * x12.yw);
	return 130.0 * dot(m, g);
}

fn SCREEN(src: vec4f, dst: vec4f) -> vec4f {
	return ( src + dst ) - ( src * dst );
}

fn Blur(tex: texture_storage_2d<rgba8unorm, read>, uv: vec2f, blurSize: f32, directions: f32, quality: f32) -> vec3f {
	let radius: vec2f = blurSize / commonUniforms.resolution.xy;
	var res: vec3f = textureLoad(tex, vec2<i32>(uv)).rgb;
	for(var i: f32 =1.0/quality; i<=1.0; i+=1.0/quality) {
		for( var d: f32=0.0; d < tau; d+=tau/directions)		{
			res += textureLoad( tex, vec2<i32>(uv+vec2(cos(d),sin(d))*radius*i)).rgb;
		}
	}
	res /= (quality-1.) * directions;
	return res;
}

fn ShakeUV(uv: vec2f, time: f32) -> vec2f {
	return vec2(
		uv.x + 0.002 * sin(time*3.141) * sin(time*14.14),
		uv.y + 0.002 * sin(time*1.618) * sin(time*17.32)
	);
}

fn filmDirt(uv: vec2f, time: f32) -> f32{
	let uv2: vec2f = uv + time * sin(time) * 10.;
	var res: f32 = 1.0;

	let rnd: f32 = fract(sin(time+1.)*31415.);
	if(rnd>0.3){
		let dirt: f32 =
			textureLoad(colorTexture, vec2<i32>(uv2*0.1)).r *
			textureLoad(colorTexture, vec2<i32>(uv2*0.01)).r *
			textureLoad(colorTexture, vec2<i32>(uv2*0.002)).r *
			1.0;
		res = 1.0 - smoothstep(0.4,0.6, dirt);
	}
	return res;
}

fn FpsTime(time: f32, fps: f32) -> f32{
	return f32(i32(time*fps)) / fps;
}

@compute @workgroup_size(1) fn compute_main(
	@builtin(global_invocation_id) id : vec3u
	)
{
	//let lum: f32 = length(textureLoad(colorTexture, id.xy).rgb);
	var fragColor: vec4f;

	var uv: vec2f = vec2f(id.xy);
	//vec2 mUV = iMouse.xy / iResolution.xy;

	let mUV: vec2f = vec2(0.5,0.7); /*fix mouse pos for thumbnail*/

	var col: vec4f;

	let time: f32 = FpsTime(commonUniforms.time.x, 12.);
	//fragColor = vec4((uv.x+time*0.5 % 0.1)*10.);
	//return; /* Debug FpsTime */

	let suv: vec2f = ShakeUV(uv, time);
	//fragColor = vec4((suv.xy % 0.1)*10., 0., 1.0);
	//return; /* Debug ShakeUV */

	//float grain = mix(1.0, fract(sin(dot(suv.xy+time,vec2(12.9898,78.233))) * 43758.5453), 0.25); /* random */
	let grain: f32 = mix(1.0, snoise(suv.xy*1234.), 0.15); /* simplex noise */
	//fragColor = vec4(vec3(grain), 1.0);
	//return; /* Debug grain */

	var color: vec3f = textureLoad(colorTexture, vec2<i32>(suv)).rgb;
	color *= grain;

	let Size: f32 = mUV.x * 8.;
	let Directions: f32 = 16.0;
	let Quality: f32 = 3.0;
	var blur: vec3f = Blur(colorTexture, suv, Size, Directions, Quality);
	blur *= grain;

	let Threshold: f32 = mUV.y;
	let FilterRGB: vec3f = normalize(vec3(1.5,1.2,1.0));
	let HighlightPower: f32 = 3.0 * (1. + fract(sin(time)*3.1415) * 0.3);
	let highlight: vec3f = blur * Threshold * FilterRGB * HighlightPower;

	/* dirt */
	let dirt: f32 = filmDirt(uv, time);
	//fragColor = vec4(vec3(dirt), 1.0);
	//return; /* Debug dirt */

	col = SCREEN(vec4(color,1.0), vec4(highlight,1.0));
	//col = vec4(highlight,1.0);
	//col = vec4(blur,1.0);
	col *= dirt;

	uv /= commonUniforms.resolution.xy;
	let v: vec2f = uv * (1.0 - uv.yx);
	let vig: f32 = pow(v.x*v.y * 15.0, 0.5);

	fragColor = col * vig;
	//fragColor = uv.x>0.5 ? colR : colL;
	fragColor.a = 1.0;
	textureStore(outTexture, id.xy, fragColor);
}
