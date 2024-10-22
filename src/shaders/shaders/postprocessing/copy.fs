export default `
#define USE_COLOR_MAP
#include declare_fragment_color_map

#include varying_standard

void main(void) {
	#include compute_fragment_color_map
	gl_FragColor = texelColor;
}
`;
