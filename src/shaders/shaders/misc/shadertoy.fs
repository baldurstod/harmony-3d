export default `
#define iTime TIME
#define iFrame int(FRAME)
#define iResolution vec3(uResolution)
#define iMouse vec4(0.0)
uniform sampler2D noiseMap;

#include shadertoy_code

#include varying_standard

void main(void) {
	mainImage(gl_FragColor, gl_FragCoord.xy);
	gl_FragColor.a = 1.;
	gl_FragDepth = 0.9999999;
	//#include compute_fragment_standard
}
`;
