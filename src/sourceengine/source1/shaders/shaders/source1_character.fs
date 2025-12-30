export default `
#include source1_fragment_common
#include declare_camera_position
const vec4 defaultNormalTexel = vec4(0.5, 0.5, 1.0, 1.0);

uniform vec3 phongfresnelranges;

#include declare_fragment_color_map
#include declare_fragment_normal_map
#include declare_fragment_phong_exponent_map
#include declare_fragment_mask_map
#include declare_fragment_alpha_test
#include source1_declare_phong
#include source1_declare_sheen
#include source1_declare_selfillum
#include declare_fragment_cube_map

uniform vec4 g_ShaderControls;
#define g_fPixelFogType					g_ShaderControls.x
#define g_fWriteDepthToAlpha			g_ShaderControls.y
#define g_fWriteWaterFogToDestAlpha		g_ShaderControls.z
#define g_fVertexAlpha					g_ShaderControls.w

uniform vec4 g_DiffuseModulation;
uniform vec3 uCubeMapTint;
uniform float uBlendTintColorOverBase;

#include source1_final_output_const

#include declare_lights

#include source1_varying_character

#define uBaseMapAlphaPhongMask 0//TODO: set proper uniform
void main(void) {
	vec4 diffuseColor = vec4(1.0);
	#include compute_fragment_color_map
	#include compute_fragment_normal_map
	#include compute_fragment_phong_exponent_map
	#include compute_fragment_mask1_map
	#include compute_fragment_mask2_map

	#include compute_fragment_normal

	float phongMask = 0.0;
	#ifdef USE_NORMAL_MAP
		vec3 tangentSpaceNormal = mix(2.0 * texelNormal.xyz - 1.0, vec3(0, 0, 1), float(uBaseMapAlphaPhongMask));
		#ifdef USE_COLOR_ALPHA_AS_PHONG_MASK
			phongMask = texelColor.a;
		#else
			phongMask = texelNormal.a;
		#endif
	#else
		vec3 tangentSpaceNormal = mix(2.0 * defaultNormalTexel.xyz - 1.0, vec3(0, 0, 1), float(uBaseMapAlphaPhongMask));
		#ifdef USE_COLOR_ALPHA_AS_PHONG_MASK
			phongMask = texelColor.a;
		#endif
	#endif
	//float phongMask = mix(texelNormal.a, texelColor.a, float(uBaseMapAlphaPhongMask));
	fragmentNormalCameraSpace = normalize(TBNMatrixCameraSpace * tangentSpaceNormal);

	diffuseColor *= texelColor;
	#include compute_fragment_alpha_test

	vec3 albedo = texelColor.rgb;
	#include source1_blend_tint
	#include compute_fragment_cube_map

	float alpha = g_DiffuseModulation.a;
	#include source1_colormap_alpha


	alpha = alpha;//lerp(alpha, alpha * vVertexColor.a, g_fVertexAlpha);



	float fogFactor = 0.0;
	//gl_FragColor = FinalOutputConst(vec4(albedo, alpha), fogFactor, g_fPixelFogType, TONEMAP_SCALE_LINEAR, g_fWriteDepthToAlpha, worldPos_projPosZ.w );
	//gl_FragColor = FinalOutputConst( float4( result.rgb, alpha ), fogFactor, g_fPixelFogType, TONEMAP_SCALE_LINEAR, g_fWriteDepthToAlpha, i.worldPos_projPosZ.w );

	if (gl_FragCoord.x < 400.) {
		//gl_FragColor = vec4(texelColor.rgb, 1.);
	}
	/*if (length(floor((gl_FragCoord.xy + vec2(15.0)) / 30.0) * 30.0 - gl_FragCoord.xy) > 10.0) {
		discard;
	}*/
#ifndef IS_TRANSLUCENT
	gl_FragColor.a = 1.0;
#endif

#ifdef USE_SHEEN_MAP
	//gl_FragColor.rgb = texture2D(sheenMaskTexture, vTextureCoord).rgb;
#endif


/* TEST SHADING BEGIN*/
	#include compute_lights_setup_vars



	BlinnPhongMaterial material;
	material.diffuseColor = albedo;//diffuseColor.rgb;//vec3(1.0);//diffuseColor.rgb;
	material.specularColor = vec3(phongMask);
#ifdef USE_PHONG_EXPONENT_MAP
	#ifdef USE_PHONG_ALBEDO_TINT
		material.specularColor = mix(vec3(1.0), texelColor.rgb, texelPhongExponent.g) * phongMask;
	#endif
	material.specularShininess = texelPhongExponent.r * uPhongExponentFactor;
#else
	material.specularShininess = uPhongExponent;
#endif
	material.specularStrength = uPhongBoost;
#ifdef SOURCE1_SPECULAR_STRENGTH
	material.specularStrength *= float(SOURCE1_SPECULAR_STRENGTH);
#endif

#if NUM_POINT_LIGHTS > 0
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		computePointLightIrradiance(uPointLights[i], geometry, directLight);
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
#endif

#if defined( RE_IndirectDiffuse )

	vec3 iblIrradiance = vec3( 0.0 );

	vec3 irradiance = getAmbientLightIrradiance( uAmbientLight );

	irradiance += getLightProbeIrradiance( lightProbe, geometry );

	#if ( NUM_HEMI_LIGHTS > 0 )

		#pragma unroll_loop
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );

		}

	#endif

#endif

#if defined( RE_IndirectDiffuse )

	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );

#endif

#if defined( RE_IndirectSpecular )

	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );

#endif

/* TEST SHADING END*/

/* TEST SHADING BEGIN*/
#ifdef USE_PHONG_SHADING
	gl_FragColor.rgb = (reflectedLight.directSpecular + reflectedLight.directDiffuse + reflectedLight.indirectDiffuse);
#else
	gl_FragColor.rgb = (reflectedLight.directDiffuse + reflectedLight.indirectDiffuse);
#endif
gl_FragColor.a = alpha;

/* TEST SHADING END*/


#ifdef USE_CUBE_MAP
	#if defined(USE_NORMAL_MAP) && defined(USE_NORMAL_ALPHA_AS_ENVMAP_MASK)
		gl_FragColor.rgb += cubeMapColor.rgb * uCubeMapTint.rgb * texelNormal.a;
	#else
		gl_FragColor.rgb += cubeMapColor.rgb * uCubeMapTint.rgb * texelColor.a;
	#endif
#endif


	//gl_FragColor = texelMask1;

	#include source1_compute_selfillum
	#include source1_compute_sheen
	#include compute_fragment_standard
	#include compute_fragment_render_mode
}
`;
