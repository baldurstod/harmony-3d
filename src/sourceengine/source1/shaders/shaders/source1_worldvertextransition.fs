export default `
#include declare_lights
#include declare_shadow_mapping
uniform sampler2D colorMap;
uniform sampler2D color2Map;
uniform sampler2D blendModulateMap;
uniform sampler2D lightMap;
/*uniform sampler2D normalMap;
uniform samplerCube cubeMap;*/

uniform vec3 uColor;
uniform vec3 uEnvMapTint;
uniform float uAlpha;
uniform bool uAlphaTest;
uniform float uUseCubeMap;
uniform float uUseEnvMapMask;
uniform float blendTintByBaseAlpha;
uniform float blendTintColorOverBase;
uniform float uBaseAlphaEnvMapMask;
uniform float uNormalMapAlphaEnvMapMask;
uniform float uEnvMapIntensity;
uniform float uMaskEnvByMetalness;
uniform bool uUseLighting;


uniform vec3 uAmbientColor;

const vec4 c1 = vec4(3.0, -2.0, 0.5, 0.5);

#include source1_varying_worldvertextransition

/* worldvertextransition.fs */
void main(void) {
	#include compute_fragment_color_map


	#include compute_fragment_normal

	vec4 texture2Color = texture2D(color2Map, vTextureCoord.xy);
		vec4 blendModulateColor = texture2D(blendModulateMap, vec2(mod(vTextureCoord.s, 1.0), mod(vTextureCoord.t, 1.0)));/*TODO: transform*/
	if(uAlphaTest && (texelColor.a <= 0.5)) {
		discard;
	}
		float vVertexAlpha2;

	#ifdef USE_BLEND_MODULATE_MAP
			vVertexAlpha2 = vVertexAlpha - blendModulateColor.g;
			vVertexAlpha2 = clamp(vVertexAlpha2 + c1.a, 0.0, 1.0);
		float vVertexAlpha3 =	c1.g * vVertexAlpha2 + c1.r;
			vVertexAlpha3 = vVertexAlpha3 * vVertexAlpha2;
			vVertexAlpha2 = vVertexAlpha3 * vVertexAlpha2;
	#else
		vVertexAlpha2 = vVertexAlpha;
	#endif

	#ifdef USE_COLOR_MAP
		#ifdef USE_COLOR2_MAP
			gl_FragColor = mix(texelColor, texture2Color, vVertexAlpha2);
		#else
			gl_FragColor = texelColor;
		#endif
	#else
		#ifdef USE_COLOR2_MAP
			gl_FragColor = texture2Color;
		#else
			gl_FragColor = vec4(1.0);
		#endif
	#endif
#ifdef USE_LIGHTING
#ifdef UNDEFINED
	gl_FragColor *= max( 1.0 - vEyeDistance / 1000.0, 0.1);
#endif
#endif
/*
	#include compute_lights_setup_vars
	BlinnPhongMaterial material;
	material.diffuseColor = texelColor.rgb;
	material.specularColor = vec3(1.0);//specular;
	material.specularShininess = 5.0;//shininess;
	material.specularStrength = 1.0;//specularStrength;

	#include compute_fragment_lights

	gl_FragColor.a = 1.0;
	#ifdef USE_PHONG_SHADING
		gl_FragColor.rgb = (reflectedLight.directSpecular + reflectedLight.directDiffuse + reflectedLight.indirectDiffuse);
	#else
		gl_FragColor.rgb = (reflectedLight.directDiffuse + reflectedLight.indirectDiffuse);
	#endif
*/
	#include compute_fragment_standard
}


/*
; STATIC: "DETAIL" "0..1"
; STATIC: "BLENDMODULATETEXTURE" "0..1"
ps.1.4

def c1, 3.0, -2.0, 0.5, 0.5

texld	r0, t0
texld	r1, t1
texld	r2, t2
#if DETAIL
texld	r3, t3 ; detail
#endif
#if BLENDMODULATETEXTURE
texld	r4, t4 ; detail
#endif

#if BLEND_MODULATETEXTURE
sub r5.a, v0.a, r4.g
add_sat r5.a, r5.a, c1.a
mad	r6.a, c1.g, r5.a, c1.r
mul r6.a, r6.a, r5.a
mul r5.a, r6.a, r5.a
#else
mov_sat r5.a, v0.a
#endif
lrp r0, r5.a, r1, r0

mul r0, r0, r2
#if DETAIL
mul_x2 r0.rgb, r0, r3
#endif
mul_x2 r0.rgb, c0, r0 ; * 2 * (overbrightFactor/2)
*/
`;
