export default `

#define USE_COLOR_MAP
#include declare_fragment_color_map

uniform float uHorizontalTiles;

#include varying_standard

#define lum(pix) dot( pix, vec4(.3,.59,.11,0) ) //luminance
#define T(x,y) texture( colorMap, uv2 + vec2(x,y) )

void computeSquarePixel(out vec4 fragColor, in vec2 fragCoord) {
	vec2 pixelWH = vec2(uHorizontalTiles / uResolution.xy);

	vec2 xy = floor(fragCoord.xy / uHorizontalTiles) * pixelWH + pixelWH / 2.0;

	vec2 uv = (fragCoord - 0.5 * uResolution.xy) / uResolution.y * uHorizontalTiles;

	float unit = 2.0 * uHorizontalTiles / uResolution.y;

	vec2 rep = vec2(1.0, 1.); // 1.73 ~ sqrt(3)
	vec2 hrep = 0.5 * rep;
	vec2 a = mod(uv, rep) - hrep;
	vec2 b = mod(uv - hrep, rep) - hrep;
	vec2 hexUv = b;//dot(a, a) < dot(b, b) ? a : b;
	vec2 cellId = uv - hexUv;

	vec2 sampleUv = cellId / uHorizontalTiles;
	sampleUv.x *= uResolution.y / uResolution.x;

	fragColor = texture2D(colorMap, sampleUv + 0.5);
}

void computeDiamondPixel(out vec4 fragColor, in vec2 fragCoord) {
	vec2 pixelWH = vec2(uHorizontalTiles / uResolution.xy);

	vec2 xy = floor(fragCoord.xy / uHorizontalTiles) * pixelWH + pixelWH / 2.0;

	vec2 uv = (fragCoord - 0.5 * uResolution.xy) / uResolution.y * uHorizontalTiles;

	float unit = 2.0 * uHorizontalTiles / uResolution.y;

	vec2 rep = vec2(1.0, 1.); // 1.73 ~ sqrt(3)
	vec2 hrep = 0.5 * rep;
	vec2 a = mod(uv, rep) - hrep;
	vec2 b = mod(uv - hrep, rep) - hrep;
	vec2 hexUv = dot(a, a) < dot(b, b) ? a : b;
	vec2 cellId = uv - hexUv;

	vec2 sampleUv = cellId / uHorizontalTiles;
	sampleUv.x *= uResolution.y / uResolution.x;

	fragColor = texture2D(colorMap, sampleUv + 0.5);
}

void computeRoundPixel1(out vec4 fragColor, in vec2 fragCoord) {
	vec2 div = vec2(uHorizontalTiles) * uResolution.xy / uResolution.y;


	vec2 uv = fragCoord/uResolution.xy;
	vec2 uv2 = floor(uv*div)/div;

	vec2 diff = (uv-uv2)*div;

	vec4 pix = texture(colorMap, uv2);

	if ( pow(diff.x - 0.5,2.0) + pow(diff.y - 0.5,2.0) > 0.25) {

		vec4 pmax;
		vec4 pmin;
		vec2 v2 = 1.0 / div;

		if (diff.x<0.5) { v2.x = -v2.x; }
		if (diff.y<0.5) { v2.y = -v2.y; }

		vec4 p1 = texture(colorMap, uv2 + vec2( 0.0, v2.y ));
		vec4 p2 = texture(colorMap, uv2 + vec2( v2.x, 0.0 ));
		vec4 p3 = texture(colorMap, uv2 + vec2( v2.x, v2.y ));

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

	fragColor = pix;
}

void computeRoundPixel2(out vec4 fragColor, in vec2 fragCoord) {
	float pixelSize = uResolution.y / uHorizontalTiles;
	vec2 U = fragCoord / pixelSize;
	vec2 div = pixelSize / uResolution.xy;
	vec2 uv2 = floor(U)*div;
	vec2 diff = fract(U);

	//checkerboard pattern : half of the pixels are not changed
	if (fract( dot(floor(U),vec2(.5)) ) < .5)
	{ fragColor = T(0,0); return; }

	// neighbors
	vec4[4] pix = vec4[4](
		texture( colorMap, uv2 + vec2(0, div.y)),
		texture( colorMap, uv2 + vec2(div.x, 0)),
		texture( colorMap, uv2 + vec2(0, -div.y)),
		texture( colorMap, uv2 + vec2(-div.x, 0)));

	//where is the biggest contrast ?
	int comp = int ( abs( lum(pix[0]) - lum(pix[2]) )
	> abs( lum(pix[1]) - lum(pix[3]) ) );
	vec2 d = abs(diff-.5) - vec2(1-comp,comp); // offset = 0,1 or 1,0
	ivec2 v = ivec2( vec2(3.5,2.5) - diff*2. );

	fragColor = dot(d,d) < .5
	? pix[ v[comp] ]								 // 2 circles on the borders
	: mix( pix[comp+2], pix[comp] , diff[1-comp] ); // a gradient in between
}


float hexDist(in vec2 p) {
	p = abs(p);
	float edgeDist = dot(p, normalize(vec2(1.0, 1.73)));
	return max(edgeDist, p.x);
}

void computeHexagonPixel(out vec4 fragColor, in vec2 fragCoord) {
	vec2 uv = (fragCoord - 0.5 * uResolution.xy) / uResolution.y * uHorizontalTiles;
	float unit = 2.0 * uHorizontalTiles / uResolution.y;

	vec2 rep = vec2(1.0, 1.73); // 1.73 ~ sqrt(3)
	vec2 hrep = 0.5 * rep;
	vec2 a = mod(uv, rep) - hrep;
	vec2 b = mod(uv - hrep, rep) - hrep;
	vec2 hexUv = dot(a, a) < dot(b, b) ? a : b;
	vec2 cellId = uv - hexUv;

	vec2 sampleUv = cellId / uHorizontalTiles;
	sampleUv.x *= uResolution.y / uResolution.x;
	float brightness = dot(texture(colorMap, sampleUv + 0.5).rgb, vec3(1.0 / 3.0));
	fragColor = vec4(1.0);//vec4(smoothstep(unit, 0.0, hexDist(hexUv) - brightness * 0.5));
	fragColor.rgb *=texture(colorMap, sampleUv + 0.5).rgb;
}
vec2 hash2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}
void computeVoronoiPixel(out vec4 fragColor, in vec2 fragCoord) {
	vec2 uv = fragCoord.xy / uResolution.xy;

    vec2 pixelating = uResolution.yx / uResolution.y / uHorizontalTiles;//mix(0.03, 0.005, pow(cos(0.0), 2.0));

    uv = (uv-0.5)/pixelating;

    vec2 n = floor(uv);
    vec2 f = fract(uv);

    //----------------------------------
    // regular voronoi from Inigo Quilez,
    // https://www.shadertoy.com/view/ldl3W8
    //----------------------------------
	vec2 mg, mr;

    // best distance
    float md = 8.0;
    // best delta vector
    vec2 mv;
    for(int j=-1;j<=1;j++)
    for(int i=-1;i<=1;i++) {
        vec2 g = vec2(float(i),float(j));
		vec2 o = hash2(n + g);
        #ifdef ANIMATE_VORONOI
        o = 0.5 + 0.5*sin(iTime + 6.2831*o);
        #endif
        vec2 r = g + o - f;
        float d = dot(r,r);
        if(d < md) {
            md = d;
            mv = r;
        }
    }

    uv += mv;

    uv = uv * pixelating+0.5;

	fragColor = texture(colorMap, uv);
}
void computeTrianglePixel(out vec4 fragColor, in vec2 fragCoord) {
	vec2 uv = fragCoord.xy / uResolution.xy;

	vec2 pixelating = uResolution.yx / uResolution.y / uHorizontalTiles;

	uv = (uv - 0.5) / pixelating;
	vec2 uvTriangleSpace = mat2(1.0, 1.0, 0.6, -0.6) * uv;
	uvTriangleSpace = fract(uvTriangleSpace);
	if(uvTriangleSpace.x > uvTriangleSpace.y) uvTriangleSpace.x -= 0.5;
	uv -= mat2(0.5, 0.833, 0.5, -0.833) * uvTriangleSpace + vec2(-0.25, 0.25);

	fragColor = texture(colorMap, clamp(uv * pixelating + 0.5, 0.01, 0.99));
}


#ifndef PIXEL_STYLE
	#define PIXEL_STYLE 0
#endif

void main(void) {

	#if (PIXEL_STYLE == 0)
		computeSquarePixel(gl_FragColor, gl_FragCoord.xy);
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
`;
