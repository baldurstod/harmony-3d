export default `
#include declare_fragment_color_map
#include declare_fragment_normal_map
#include declare_fragment_alpha_test
uniform sampler2D g_tAmbientOcclusion;
uniform vec4 g_vColorTint;

#include source2_varying_vr_eyeball

void main(void) {
	vec4 diffuseColor = vec4(1.0);
	#include compute_fragment_color_map

	diffuseColor *= texelColor;
	#include compute_fragment_alpha_test

	gl_FragColor = diffuseColor - vec4(vec3(0.5), 0.0);// * vec4(vec3(0.01), 1.0);
		//gl_FragColor = vec4(vTextureCoord, 1.0, 1.0);
	gl_FragColor = vec4(diffuseColor);
		//gl_FragColor.rgb *= 0.00000;
		gl_FragColor.a = 1.0;



		//gl_FragColor = vec4(vTextureCoord, 1.0, 1.0);
		//gl_FragColor = texture2D(colorMap, vTextureCoord * vec2(1.0, 1.0) + vec2(0.5, 0.0));
		gl_FragColor.rgb *= g_vColorTint.rgb;
		gl_FragColor.rgb *= texture2D(g_tAmbientOcclusion, vTextureCoord.xy).rrr;

#ifdef IS_TRANSLUCENT
	gl_FragColor.rgb = g_vColorTint.rgb * diffuseColor.rgb * diffuseColor.a;
	gl_FragColor.a = diffuseColor.a;
#else
	gl_FragColor.rgb = g_vColorTint.rgb * diffuseColor.rgb;
#endif
	#include compute_fragment_standard
}
`;
