export default `
uniform sampler2D colorMap;
uniform sampler2D g_tAmbientOcclusion;
uniform vec4 g_vColorTint;

#include source2_varying_vr_skin

void main(void) {
		vec4 textureColor = texture2D(colorMap, vTextureCoord.xy);
		gl_FragColor = textureColor - vec4(vec3(0.5), 0.0);// * vec4(vec3(0.01), 1.0);
		//gl_FragColor = vec4(vTextureCoord, 1.0, 1.0);
		gl_FragColor = vec4(textureColor);
		//gl_FragColor.rgb *= 0.00000;
		gl_FragColor.a = 1.0;



		//gl_FragColor = vec4(vTextureCoord, 1.0, 1.0);
		//gl_FragColor = texture2D(colorMap, vTextureCoord * vec2(1.0, 1.0) + vec2(0.5, 0.0));
		gl_FragColor.rgb *= g_vColorTint.rgb;
		gl_FragColor.rgb *= texture2D(g_tAmbientOcclusion, vTextureCoord.xy).rrr;

		gl_FragColor.rgb = textureColor.rgb;
	#include compute_fragment_standard
}
`;
