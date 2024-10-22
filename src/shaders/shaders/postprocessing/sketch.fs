export default `
float dist = 6.0; // how far to sample from
int loops = 60; // how many times to sample, more = smoother

#define USE_COLOR_MAP
#include declare_fragment_color_map

uniform float uGrainIntensity;
const float PI2 = PI * 2.0;
const int mSize = 9;
const int kSize = (mSize-1)/2;
const float sigma = 3.0;
float kernel[mSize];

// Gaussian PDF
float normpdf(in float x, in float sigma)
{
	return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}

//
vec3 colorDodge(in vec3 src, in vec3 dst)
{
    return step(0.0, dst) * mix(min(vec3(1.0), dst/ (1.0 - src)), vec3(1.0), step(1.0, src));
}

float greyScale(in vec3 col)
{
    return dot(col, vec3(0.3, 0.59, 0.11));
    //return dot(col, vec3(0.2126, 0.7152, 0.0722)); //sRGB
}

vec2 random(vec2 p){
	p = fract(p * (vec2(314.159, 314.265)));
    p += dot(p, p.yx + 17.17);
    return fract((p.xx + p.yx) * p.xy);
}

vec2 random2(vec2 p)
{
    return texture(colorMap, p / vec2(1024.0)).xy;
    //blue1 = texture(iChannel1, p / vec2(1024.0));
    //blue2 = texture(iChannel1, (p+vec2(137.0, 189.0)) / vec2(1024.0));
}



#include varying_standard

void main(void) {
	float grain = 1.0 - rand(vTextureCoord.xy) * uGrainIntensity;

	gl_FragColor = texture2D(colorMap, vTextureCoord.xy) * vec4(grain, grain, grain, 1.0);
    vec2 q = vTextureCoord.xy;
    vec3 col = texture(colorMap, q).rgb;

    vec2 r = random(q);
    r.x *= PI2;
    vec2 cr = vec2(sin(r.x),cos(r.x))*sqrt(r.y);

    vec3 blurred = texture(colorMap, q + cr * (vec2(mSize) / uResolution.xy) ).rgb;

    // comparison
    if (false) {
        blurred = vec3(0.0);
        float Z = 0.0;
        for (int j = 0; j <= kSize; ++j) {
            kernel[kSize+j] = kernel[kSize-j] = normpdf(float(j), sigma);
        }
        for (int j = 0; j < mSize; ++j) {
            Z += kernel[j];
        }

		// this can be done in two passes
        for (int i = -kSize; i <= kSize; ++i) {
            for (int j = -kSize; j <= kSize; ++j) {
                blurred += kernel[kSize+j]*kernel[kSize+i]*texture(colorMap, (gl_FragCoord.xy+vec2(float(i),float(j))) / uResolution.xy).rgb;
            }
    	}
   		blurred = blurred / Z / Z;

        // an interesting ink effect
        //r = random2(q);
        //vec2 cr = vec2(sin(r.x),cos(r.x))*sqrt(-2.0*r.y);
        //blurred = texture(iChannel0, q + cr * (vec2(mSize) / iResolution.xy) ).rgb;
    }

    vec3 inv = vec3(1.0) - blurred;
    // color dodge
    vec3 lighten = colorDodge(col, inv);
    // grey scale
    vec3 res = vec3(greyScale(lighten));

    // more contrast
    res = vec3(pow(res.x, 3.0));
    //res = clamp(res * 0.7 + 0.3 * res * res * 1.2, 0.0, 1.0);

    // edge effect
    //if (iMouse.z > 0.5) res *= 0.25 + 0.75 * pow( 16.0 * q.x * q.y * (1.0 - q.x) * (1.0 - q.y), 0.15 );
	gl_FragColor = vec4(res, 1.0);


}

`;
