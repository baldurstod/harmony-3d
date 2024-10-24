export default `
#include source1_declare_gamma_functions

uniform sampler2D colorMap;
uniform float uAddSelf;
#include declare_fragment_alpha_test

#include declare_lights
#include declare_shadow_mapping

#include source1_varying_unlit_generic

void main(void) {
	vec4 diffuseColor = vec4(1.0);
	#include compute_fragment_color_map
	diffuseColor *= texelColor;
	#include compute_fragment_alpha_test
	//vec4 textureColor = texture2D(colorMap, vTextureCoord.xy);
	//gl_FragColor = textureColor * (vColor + vec4(uAddSelf));
	//gl_FragColor = texelColor * (vColor + vec4(uAddSelf)) * texelColor.a;
	#if defined(USE_VERTEX_COLOR) || defined(HARDWARE_PARTICLES)
		gl_FragColor = texelColor * vColor;
	#else
		gl_FragColor = texelColor;
	#endif
	//gl_FragColor = vColor;
	#include compute_fragment_standard
}
`;
