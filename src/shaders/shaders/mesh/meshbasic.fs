export default `
#include declare_fragment_standard
#include declare_lights
#include declare_shadow_mapping

#include declare_fragment_diffuse
#include declare_fragment_color_map

#include varying_standard

void main(void) {
	#include compute_fragment_diffuse
	#include compute_fragment_color_map
#ifdef USE_COLOR_MAP
	diffuseColor *= texelColor;
#endif
	gl_FragColor = diffuseColor;

	#include compute_fragment_standard
}
`;
