export default `
#include declare_fragment_color_map
#include declare_fragment_normal_map
#include declare_fragment_alpha_test
#include declare_fragment_mask_map
#include source2_fragment_declare_detail_map

uniform sampler2D g_tAmbientOcclusion;
uniform vec4 g_vColorTint;

#include source2_fragment_declare_separate_alpha_transform

uniform float g_flDetailBlendFactor;

#include source2_varying_crystal

void main(void) {
	gl_FragColor = vec4(1.0, 0.0, 0.5, 1.0);
	if (length(floor((gl_FragCoord.xy + vec2(15.0)) / 30.0) * 30.0 - gl_FragCoord.xy) > 10.0) {
		gl_FragColor = vec4(0.5, 0.0, 1.0, 1.0);
	}
}
`;
