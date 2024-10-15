export default `
#include source1_declare_gamma_functions

uniform sampler2D colorMap;
uniform float uAddSelf;
uniform float uOverbrightFactor;
uniform vec3 uColorScale;
#include declare_fragment_alpha_test

#include source2_varying_spritecard

#ifndef SEQUENCE_COMBINE_MODE
	#define SEQUENCE_COMBINE_MODE 0
#endif

void main(void) {
	vec4 diffuseColor = vec4(1.0);
	#include compute_fragment_color_map
	#ifdef USE_TEXTURE_COORD_2
		vec4 texelColor2 = texture2D(colorMap, vTexture2Coord.xy);
	#else
		vec4 texelColor2 = texelColor;
	#endif


#ifdef SPRITECARD_TEXTURE_CHANNEL_MIX_RGBA_RGBALPHA
	texelColor.a = texelColor.r;//TODO : use rgb luminance ?
#endif

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
		blended_rgb.rgb *= GammaToLinear(vColor.rgb);
	#else
		blended_rgb *= GammaToLinear(vColor);
	#endif
	gl_FragColor = blended_rgb;
#ifdef IS_ROPE
	//gl_FragColor = vec4(1.0);
#endif
	#include compute_fragment_standard
	gl_FragColor = vec4(vTextureCoord.xy, 0.0, vColor.a) * vColor.a;
	gl_FragColor = texelColor * vColor * vColor.a;
	gl_FragColor = texelColor * pow(vColor, vec4(2.2)) * texelColor.a;
	gl_FragColor = texelColor * vColor * texelColor.a;
	//gl_FragColor = texelColor;
	//gl_FragColor.a = texelColor.a;
#if SEQUENCE_COMBINE_MODE == 0
	#define TEXEL_RGB texelColor.rgb
	#define TEXEL_ALPHA texelColor.a
#endif
#if SEQUENCE_COMBINE_MODE == 1//SEQUENCE_COMBINE_MODE_ALPHA_FROM0_RGB_FROM_1
	#define TEXEL_RGB texelColor2.rgb
	#define TEXEL_ALPHA texelColor.a
#endif
	gl_FragColor.rgb = TEXEL_RGB * vColor.rgb * TEXEL_ALPHA * uColorScale;
	//gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(2.2));
	gl_FragColor.a = vColor.a * TEXEL_ALPHA;
	//gl_FragColor.a = TEXEL_ALPHA;
}`;
