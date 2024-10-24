export default `
#include source1_declare_gamma_functions

uniform sampler2D colorMap;
uniform float uAddSelf;
uniform float uOverbrightFactor;
#include declare_fragment_alpha_test

#include source1_varying_spritecard

void main(void) {
	vec4 diffuseColor = vec4(1.0);
	#include compute_fragment_color_map
	diffuseColor *= texelColor;
	#include compute_fragment_alpha_test
	//vec4 textureColor = texture2D(colorMap, vTextureCoord.xy);
	//gl_FragColor = textureColor * (vColor + vec4(uAddSelf));
	//gl_FragColor = texelColor * (vColor + vec4(uAddSelf)) * texelColor.a;
	vec4 blended_rgb = texelColor;
	blended_rgb.rgb *= uOverbrightFactor;
	//blended_rgb = pow(blended_rgb, vec4(2.2));
	#ifdef ADD_SELF
		blended_rgb.a *= vColor.a;
		blended_rgb.rgb *= blended_rgb.a;
		blended_rgb.rgb += uOverbrightFactor * uAddSelf * vColor.a * blended_rgb.rgb;
		blended_rgb.rgb *= vColor.rgb * vColor.a;
	#else
		blended_rgb *= vColor;
	#endif
	gl_FragColor = blended_rgb;
#ifdef IS_ROPE
	//gl_FragColor = vec4(1.0);
#endif
	#include compute_fragment_standard
}`;
