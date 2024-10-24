export default `
uniform vec3 phongfresnelranges;

uniform sampler2D colorMap;
#ifdef ALPHA_TEST
uniform float uAlphaTestReference;
#endif

varying vec2 vTextureCoord;
void main(void) {
		vec4 textureColor = texture2D(colorMap, vTextureCoord);
#ifdef ALPHA_TEST
		if (textureColor.a < uAlphaTestReference) {
			discard;
		}
#endif

		gl_FragColor = textureColor;
		gl_FragColor = vec4(0.5, 0.5, 1.0, 0.5);
		/*if (length(mod(gl_FragCoord.xy, vec2(2.0))) > 1.0) {
			discard;
		}*/
	#include compute_fragment_standard
}
`;
