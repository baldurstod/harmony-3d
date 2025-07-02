export default `
#include source1_fragment_common
#include declare_camera_position
const vec4 defaultNormalTexel = vec4(0.5, 0.5, 1.0, 1.0);

uniform vec3 phongfresnelranges;

#include declare_fragment_color_map
#include declare_fragment_detail_map
#include declare_fragment_normal_map
#include declare_fragment_phong_exponent_map
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
uniform float uDetailBlendFactor;

#include source1_final_output_const

#include declare_lights
#include declare_shadow_mapping
#include declare_log_depth

#include source1_varying_vertexlit_generic

#define uBaseMapAlphaPhongMask 0//TODO: set proper uniform
void main(void) {
	#ifdef NO_DRAW
		discard;
	#endif

	vec4 diffuseColor = vec4(1.0);
	#include compute_fragment_color_map
	#include compute_fragment_detail_map
	#include compute_fragment_normal_map
	#include compute_fragment_phong_exponent_map

	#include compute_fragment_normal

	float phongMask = 1.0;
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
	if (length(mod(gl_FragCoord.xy, vec2(2.0))) < 1.0) {
	//	discard;
	}
	//gl_FragColor = vec4(albedo, alpha);
	//gl_FragColor.rgb = g_DiffuseModulation.rgb;


#ifdef USE_SHEEN_MAP
	//gl_FragColor.rgb = texture2D(sheenMaskMap, vTextureCoord).rgb;
#endif



	#if defined(USE_DETAIL_MAP) && defined(DETAIL_BLEND_MODE)
		#if (DETAIL_BLEND_MODE == 0)
		//TODO
		#elif (DETAIL_BLEND_MODE == 1)
			gl_FragColor.rgb += texelDetail.rgb * uDetailBlendFactor;
		#elif (DETAIL_BLEND_MODE == 2)
		//TODO
		#elif (DETAIL_BLEND_MODE == 3) // TCOMBINE_FADE
			albedo = mix(albedo, texelDetail.rgb, uDetailBlendFactor);
		#endif
	#endif


/* TEST SHADING BEGIN*/
	#include compute_lights_setup_vars



	BlinnPhongMaterial material;
	material.diffuseColor = albedo;//diffuseColor.rgb;//vec3(1.0);//diffuseColor.rgb;
	material.specularColor = vec3(phongMask);
#ifdef USE_PHONG_EXPONENT_MAP
	#ifdef USE_PHONG_ALBEDO_TINT
		material.specularColor = mix(vec3(1.0), texelColor.rgb, texelPhongExponent.g);
	#endif
	material.specularShininess = texelPhongExponent.r * uPhongExponentFactor;
#else
	material.specularShininess = uPhongBoost * uPhongExponent;
#endif
	material.specularStrength = phongMask;
#ifdef SOURCE1_SPECULAR_STRENGTH
	material.specularStrength *= float(SOURCE1_SPECULAR_STRENGTH);
#endif

#include compute_fragment_lights

/* TEST SHADING END*/

/* TEST SHADING BEGIN*/

vec3 diffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
#include source1_compute_selfillum


#ifdef USE_PHONG_SHADING
	gl_FragColor.rgb = (reflectedLight.directSpecular + diffuse);
#else
	gl_FragColor.rgb = (diffuse);
#endif
gl_FragColor.a = alpha;

//gl_FragColor.rgb = vec3(phongMask);
/* TEST SHADING END*/
//gl_FragColor.rgb = texelPhongExponent.rgb;
//gl_FragColor.rgb = material.specularColor;
//gl_FragColor.rgb = vec3(texelColor.a);


#ifdef USE_CUBE_MAP
	#if defined(USE_NORMAL_MAP) && defined(USE_NORMAL_ALPHA_AS_ENVMAP_MASK)
		gl_FragColor.rgb += cubeMapColor.rgb * uCubeMapTint.rgb * texelNormal.a;
	#else
		gl_FragColor.rgb += cubeMapColor.rgb * uCubeMapTint.rgb * texelColor.a;
	#endif
#endif




/*


	computePointLightIrradiance(uPointLights[0], geometry, directLight);
	RE_Direct( directLight, geometry, material, reflectedLight );
		float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
		irradiance = dotNL * directLight.color;

	vec3 halfDir = normalize( directLight.direction + geometry.viewDir );
	float dotNH = saturate( dot( geometry.normal, halfDir ) );
	float dotLH = saturate( dot( directLight.direction, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, dotLH );
	float D = D_BlinnPhong( material.specularShininess, dotNH );

	float D_BlinnPhong = RECIPROCAL_PI * ( material.specularShininess * 0.5 + 1.0 ) * pow( dotNH + 0.1, material.specularShininess );


gl_FragColor.rgb = 0.5 + 0.5 * vec3(D_BlinnPhong);
*/
#ifdef SKIP_LIGHTING
	gl_FragColor.rgb = albedo;
#endif

	#include source1_compute_sheen
	#include compute_fragment_standard
	#include compute_fragment_log_depth

	#if defined(USE_DETAIL_MAP) && defined(DETAIL_BLEND_MODE)
		#if (DETAIL_BLEND_MODE == 5)
		//TODO
		#elif (DETAIL_BLEND_MODE == 6)
			float f = uDetailBlendFactor - 0.5;
			float fMult = (f >= 0.0) ? 1.0 / uDetailBlendFactor : 4.0 * uDetailBlendFactor;
			float fAdd = (f >= 0.0) ? 1.0-fMult : -0.5*fMult;
			gl_FragColor.rgb += saturate(fMult * texelDetail.rgb + fAdd);
		#endif
	#endif

	#include compute_fragment_render_mode
}
`;
