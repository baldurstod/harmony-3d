export default `
#define USE_COLOR_MAP
#include declare_fragment_color_map

uniform float uSaturation;

#include varying_standard

void main(void) {
	#include compute_fragment_color_map
	float luminance = 0.2126 * texelColor.r + 0.7152 * texelColor.g + 0.0722 * texelColor.b;

	gl_FragColor = mix(vec4(luminance), texelColor, vec4(vec3(uSaturation), 1.0));
}
`;
