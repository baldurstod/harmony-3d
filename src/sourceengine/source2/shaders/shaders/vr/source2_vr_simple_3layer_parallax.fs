export default `
uniform sampler2D colorMap;
uniform sampler2D g_tAmbientOcclusion;
uniform sampler2D g_tColorA;
uniform sampler2D g_tColorB;
uniform sampler2D g_tColorC;
uniform sampler2D g_tMasks;
uniform sampler2D g_tNormalA;
uniform sampler2D g_tEmissiveB;
uniform sampler2D g_tEmissiveC;


uniform vec4 g_vColorTint;

#include source2_varying_vr_simple_3layer_parallax

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
		//gl_FragColor.rgb *= texture2D(g_tAmbientOcclusion, vTextureCoord).rrr;
		//if (gl_FragCoord.x < 0.5 * 800.0)
		{
			gl_FragColor.rgb *= texture2D(g_tAmbientOcclusion, vTextureCoord).rrr;
		}
		gl_FragColor.rgb = texture2D(g_tEmissiveC, vTextureCoord.xy).rgb;
	#include compute_fragment_standard
}
`;
