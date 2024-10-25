export default `
#include declare_fragment_color_map
#include declare_fragment_normal_map
#include declare_fragment_alpha_test
uniform sampler2D g_tAmbientOcclusion;
uniform vec4 g_vColorTint;

#ifdef F_SELF_ILLUM
	uniform vec4 g_vSelfIllumTint;
	uniform float g_flSelfIllumOverallScale;
	uniform float g_flSelfIllumFlowSpeed;
	uniform float g_flSelfIllumFlowAmount;
#endif
#ifdef USE_MASK_PARAMETERS_MAP
	uniform sampler2D maskParametersMap;
	/*
	RED : self illum mask
	GREEN : ?
	BLUE : self illum flow phase
	*/
#endif

#ifdef USE_SIFW_MAP
	uniform sampler2D selfIllumFlowWaveformMap;
#endif

#include source2_varying_vr_xen_foliage

void main(void) {
	vec4 diffuseColor = vec4(1.0);
	#include compute_fragment_color_map
	#include compute_fragment_normal_map

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


#ifdef F_SELF_ILLUM
/*
	//---- Self Illum ----
	g_flSelfIllumBrightness "1.000"
	g_flSelfIllumCustomFlowTimer "0.000"
	g_flSelfIllumFlowAmount "1.000"
	g_flSelfIllumFlowFrequency "1.000"
	g_flSelfIllumFlowSpeed "4.000"
	g_flSelfIllumOverallScale "1.000"
	g_vSelfIllumTint "[1.000000 1.000000 1.000000 0.000000]"
	TextureSelfIllumFlowPhase "materials/default/default.tga"
	TextureSelfIllumFlowWaveform "materials/workshop_examples/combine/blind_zombie_crushed_wave.png"
	TextureSelfIllumMask "materials/workshop_examples/combine/combine_monitor_screens_selfillum.tga"
	*/
#endif

#ifdef IS_TRANSLUCENT
	gl_FragColor.rgb = g_vColorTint.rgb * diffuseColor.rgb * diffuseColor.a;
	gl_FragColor.a = diffuseColor.a;
#else
	gl_FragColor.rgb = g_vColorTint.rgb * diffuseColor.rgb;
#endif
#ifdef F_SELF_ILLUM
	vec3 selfIllumColor = g_vSelfIllumTint.rgb;
	float deltaUV = 0.0;
	#ifdef USE_MASK_PARAMETERS_MAP
		vec4 maskParametersTexel = texture2D(maskParametersMap, vTextureCoord.xy);
		//gl_FragColor.rgb = maskParametersTexel.rgb;
		selfIllumColor *= maskParametersTexel.r;
		deltaUV = maskParametersTexel.b;
	#endif

	#ifdef USE_SIFW_MAP
		vec4 selfIllumFlowWaveformTexel = texture2D(selfIllumFlowWaveformMap, vec2(mod(uTime.r * g_flSelfIllumFlowSpeed + pow(deltaUV, 2.0), 1.0), 0.5));
		//selfIllumFlowWaveStrength *= ;
		selfIllumColor *= mix(1.0, selfIllumFlowWaveformTexel.r, g_flSelfIllumFlowAmount);
	#endif


	gl_FragColor.rgb += g_flSelfIllumOverallScale * 0.5 * selfIllumColor;//TODO: why 0.5 ?
#endif

	/*vec4 selfIllumFlowWaveformTexel = texture2D(selfIllumFlowWaveformMap, vTextureCoord);
	gl_FragColor.rgb = selfIllumFlowWaveformTexel.rgb;*/
#ifdef USE_MASK_PARAMETERS_MAP
	//gl_FragColor.rgb = maskParametersTexel.rrr;
#endif
	#include compute_fragment_standard
}
`;
