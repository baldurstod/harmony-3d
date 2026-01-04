@group(0) @binding(x) var colorTexture: texture_storage_2d<rgba8unorm, read>;
@group(0) @binding(x) var outTexture: texture_storage_2d<PRESENTATION_FORMAT, write>;
@group(0) @binding(x) var<uniform> resolution : vec4f;
@group(0) @binding(x) var<uniform> uHorizontalTiles: f32;

fn mymod(x: vec2f, y: vec2f) -> vec2f {
	return x - y * floor(x / y);
}

fn lum(pix: vec4f) -> f32 {
	return dot( pix, vec4(.3,.59,.11,0));
}


fn computeSquarePixel(pos: vec2u) {
	let sizef: vec2f = vec2f(resolution.xy);
	let posf: vec2f = vec2f(pos);

	let pixelWH: vec2f = vec2(uHorizontalTiles / sizef.xy);

	let xy: vec2f = floor(posf / uHorizontalTiles) * pixelWH + pixelWH / 2.0;

	let uv: vec2f = (posf - 0.5 * sizef.xy) / sizef.y * uHorizontalTiles;

	let unit: f32 = 2.0 * uHorizontalTiles / sizef.y;

	let rep: vec2f = vec2(1.0, 1.); // 1.73 ~ sqrt(3)
	let hrep: vec2f = 0.5 * rep;
	let a: vec2f = mymod(uv , rep) - hrep;
	let b: vec2f = mymod(uv - hrep , rep) - hrep;
	let hexUv: vec2f = b;//dot(a, a) < dot(b, b) ? a : b;
	let cellId: vec2f = uv - hexUv;

	var sampleUv: vec2f = cellId / uHorizontalTiles;
	sampleUv.x *= sizef.y / sizef.x;

	var v = textureLoad(colorTexture, vec2u((sampleUv + 0.5) * sizef));
	textureStore(outTexture, pos, v);
}


fn computeDiamondPixel(pos: vec2u) {
	let posf: vec2f = vec2f(pos);

	let pixelWH: vec2f = vec2(uHorizontalTiles / resolution.xy);

	let xy: vec2f = floor(posf / uHorizontalTiles) * pixelWH + pixelWH / 2.0;

	let uv: vec2f = (posf - 0.5 * resolution.xy) / resolution.y * uHorizontalTiles;

	let unit: f32 = 2.0 * uHorizontalTiles / resolution.y;

	let rep: vec2f = vec2(1.0, 1.); // 1.73 ~ sqrt(3)
	let hrep: vec2f = 0.5 * rep;
	let a: vec2f = mymod(uv , rep) - hrep;
	let b: vec2f = mymod(uv - hrep,  rep) - hrep;
	let hexUv: vec2f = select(b, a, dot(a, a) < dot(b, b));//dot(a, a) < dot(b, b) ? a : b;
	let cellId: vec2f = uv - hexUv;

	var sampleUv: vec2f = cellId / uHorizontalTiles;
	sampleUv.x *= resolution.y / resolution.x;

	var v = textureLoad(colorTexture, min(vec2u((sampleUv + 0.5) * resolution.xy), vec2u(resolution.xy - vec2(1.0))));// TODO: improve textureLoad clamp
	textureStore(outTexture, pos, v);
}

fn computeRoundPixel1(pos: vec2u) {
	let div: vec2f = vec2(uHorizontalTiles) * resolution.xy / resolution.y;


	let uv: vec2f = vec2f(pos)/resolution.xy;
	let uv2: vec2f = floor(uv*div)/div;

	let diff: vec2f = (uv-uv2)*div;

	var pix: vec4f = textureLoad(colorTexture, vec2u(uv2 * resolution.xy));

	if ( pow(diff.x - 0.5,2.0) + pow(diff.y - 0.5,2.0) > 0.25) {

		var pmax: vec4f;
		var pmin: vec4f;
		var v2: vec2f  = 1.0 / div;

		if (diff.x<0.5) { v2.x = -v2.x; }
		if (diff.y<0.5) { v2.y = -v2.y; }

		let p1: vec4f = textureLoad(colorTexture, vec2u((uv2 + vec2( 0.0, v2.y )) * resolution.xy));
		let p2: vec4f = textureLoad(colorTexture, vec2u((uv2 + vec2( v2.x, 0.0 )) * resolution.xy));
		let p3: vec4f = textureLoad(colorTexture, vec2u((uv2 + vec2( v2.x, v2.y )) * resolution.xy));

		if ( lum(p1) > lum(p2) ) {
			pmax = p1;
			pmin = p2;
		} else {
			pmax = p2;
			pmin = p1;
		}

		if ( lum(p3) < lum(pmin) ) {
			pmin = p3;
		}

		if ( lum(pix) > lum(pmax) ) {
			pix = pmax;
		} else if ( lum(pmin) > lum(pix) ) {
			pix = pmin;
		}
	}

	textureStore(outTexture, pos, pix);
	//textureStore(outTexture, pos, vec4f(vec2f(diff), 0.0, 1.0));
	//textureStore(outTexture, pos, vec4f( pow(diff.x - 0.5,2.0) + pow(diff.y - 0.5,2.0), 0.0, 0.0, 1.0));
}

fn computeRoundPixel2(pos: vec2u) {
	let pixelSize: f32 = resolution.y / uHorizontalTiles;
	let U: vec2f = vec2f(pos) / pixelSize;
	let div: vec2f = pixelSize / resolution.xy;
	let uv2: vec2f = floor(U)*div;
	let diff: vec2f = fract(U);

	//checkerboard pattern : half of the pixels are not changed
	if (fract( dot(floor(U),vec2(.5)) ) < .5)
	{
		//fragColor = T(0,0);
		var v = textureLoad(colorTexture, pos);
		textureStore(outTexture, pos, v);
		return;
	}

	// neighbors
	let pix: mat4x4f = mat4x4f(
		textureLoad( colorTexture, vec2u(uv2 + vec2(0, div.y))),
		textureLoad( colorTexture, vec2u(uv2 + vec2(div.x, 0))),
		textureLoad( colorTexture, vec2u(uv2 + vec2(0, -div.y))),
		textureLoad( colorTexture, vec2u(uv2 + vec2(-div.x, 0))));

	//where is the biggest contrast ?
	let comp: i32 = i32 ( abs( lum(pix[0]) - lum(pix[2]) )
	> abs( lum(pix[1]) - lum(pix[3]) ) );
	let d: vec2f = abs(diff-.5) - vec2(f32(1-comp),f32(comp)); // offset = 0,1 or 1,0
	let v: vec2i = vec2i( vec2(3.5,2.5) - diff*2. );

	/*
	fragColor = dot(d,d) < .5
	? pix[ v[comp] ]								 // 2 circles on the borders
	: mix( pix[comp+2], pix[comp] , diff[1-comp] ); // a gradient in between
	*/
	textureStore(outTexture, pos, select(
		mix( pix[comp+2], pix[comp] , diff[1-comp]), // a gradient in between
		pix[ v[comp] ],								 // 2 circles on the borders
		dot(d,d) < .5
		));
}

fn hexDist(p: vec2f) -> f32 {
	let edgeDist: f32 = dot(abs(p), normalize(vec2(1.0, 1.73)));
	return max(edgeDist, abs(p.x));
}

fn computeHexagonPixel(pos: vec2u) {
	let uv: vec2f = (vec2f(pos) - 0.5 * resolution.xy) / resolution.y * uHorizontalTiles;
	let unit: f32 = 2.0 * uHorizontalTiles / resolution.y;

	let rep: vec2f = vec2(1.0, 1.73); // 1.73 ~ sqrt(3)
	let hrep: vec2f = 0.5 * rep;
	let a: vec2f = (uv % rep) - hrep;
	let b: vec2f = ((uv - hrep) % rep) - hrep;
	let hexUv: vec2f = select(b, a, dot(a, a) < dot(b, b));//dot(a, a) < dot(b, b) ? a : b;
	let cellId: vec2f = uv - hexUv;

	var sampleUv: vec2f = cellId / uHorizontalTiles;
	sampleUv.x *= resolution.y / resolution.x;
	//let brightness: f32 = dot(textureLoad(colorTexture, vec2u((sampleUv + 0.5) * resolution.xy)).rgb, vec3(1.0 / 3.0));
	//fragColor = vec4(1.0);//vec4(smoothstep(unit, 0.0, hexDist(hexUv) - brightness * 0.5));
	//fragColor.rgb *=textureLoad(colorTexture, sampleUv + 0.5).rgb;
	var v = textureLoad(colorTexture, vec2u((sampleUv + 0.5) * resolution.xy));
	textureStore(outTexture, pos, v);
}

fn hash2( p: vec2f ) -> vec2f {
	return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

fn computeVoronoiPixel(pos: vec2u) {
	var uv: vec2f = vec2f(pos) / resolution.xy;

	let pixelating: vec2f = resolution.yx / resolution.y / uHorizontalTiles;//mix(0.03, 0.005, pow(cos(0.0), 2.0));

	uv = (uv-0.5)/pixelating;

	let n: vec2f = floor(uv);
	let f: vec2f = fract(uv);

	//----------------------------------
	// regular voronoi from Inigo Quilez,
	// https://www.shadertoy.com/view/ldl3W8
	//----------------------------------
	var mg: vec2f;
	var mr: vec2f;

	// best distance
	var md: f32 = 8.0;
	// best delta vector
	var mv: vec2f;
	for(var j: i32=-1;j<=1;j++) {
		for(var i: i32=-1;i<=1;i++) {
			let g: vec2f = vec2(f32(i),f32(j));
			let o: vec2f = hash2(n + g);
			#ifdef ANIMATE_VORONOI
			o = 0.5 + 0.5*sin(iTime + 6.2831*o);
			#endif
			let r: vec2f = g + o - f;
			let d: f32 = dot(r,r);
			if(d < md) {
				md = d;
				mv = r;
			}
		}
	}

	uv += mv;

	uv = uv * pixelating+0.5;

	//fragColor = textureLoad(colorTexture, uv);
	var v = textureLoad(colorTexture, vec2u(uv));
	textureStore(outTexture, pos, v);

}
fn computeTrianglePixel(pos: vec2u) {
	var uv: vec2f = vec2f(pos) / resolution.xy;

	let pixelating: vec2f = resolution.yx / resolution.y / uHorizontalTiles;

	uv = (uv - 0.5) / pixelating;
	var uvTriangleSpace: vec2f = mat2x2f(1.0, 1.0, 0.6, -0.6) * uv;
	uvTriangleSpace = fract(uvTriangleSpace);
	if(uvTriangleSpace.x > uvTriangleSpace.y) {
		uvTriangleSpace.x -= 0.5;
	}
	uv -= mat2x2f(0.5, 0.833, 0.5, -0.833) * uvTriangleSpace + vec2(-0.25, 0.25);

	let v: vec4f = textureLoad(colorTexture, clamp(vec2i(uv * pixelating + 0.5), vec2i(0), vec2i(1)));
	textureStore(outTexture, pos, v);
}

#ifndef PIXEL_STYLE
	#define PIXEL_STYLE 0
#endif

#define PIXEL_STYLE 2

@compute @workgroup_size(1) fn compute_main(
	@builtin(global_invocation_id) id : vec3u
	)
{
	let size = textureDimensions(outTexture);
	//let center = vec2f(size) / 2.0;

	// the pixel we're going to write to
	let pos = id.xy;

	#if (PIXEL_STYLE == 0)
		computeSquarePixel(pos);
	#elif (PIXEL_STYLE == 1)
		computeDiamondPixel(pos);
	#elif (PIXEL_STYLE == 2)
		computeRoundPixel1(pos);
	#elif (PIXEL_STYLE == 3)
		computeRoundPixel2(pos);
	#elif (PIXEL_STYLE == 4)
		computeHexagonPixel(pos);
	#elif (PIXEL_STYLE == 5)
		computeVoronoiPixel(pos);
	#elif (PIXEL_STYLE == 6)
		computeTrianglePixel(pos);
	#endif

}
