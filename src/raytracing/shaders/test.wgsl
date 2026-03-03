#include matrix_uniforms
#include common_uniforms
#include declare_texture_transform
#include declare_vertex_detail_uv
#include declare_vertex_skinning

#include declare_fragment_standard
#include declare_fragment_color_map
#include declare_fragment_detail_map
#include declare_fragment_normal_map
#include declare_fragment_phong_exponent_map
#include declare_fragment_alpha_test
#include source1_declare_phong
#include source1_declare_sheen
#include source1_declare_selfillum
#include declare_fragment_cube_map

#include declare_lights
//#include declare_shadow_mapping
#include declare_log_depth

#define uBaseMapAlphaPhongMask 0//TODO: set proper uniform
const defaultNormalTexel: vec4f = vec4(0.5, 0.5, 1.0, 1.0);

/*
uniform vec4 g_DiffuseModulation;
uniform vec3 uCubeMapTint;
uniform float uBlendTintColorOverBase;
uniform float uDetailBlendFactor;
*/
@group(0) @binding(x) var<uniform> g_DiffuseModulation: vec4f;
@group(0) @binding(x) var<uniform> uCubeMapTint: vec4f;
@group(0) @binding(x) var<uniform> uBlendTintColorOverBase: f32;
@group(0) @binding(x) var<uniform> uDetailBlendFactor: f32;

#include varying_standard

@vertex
fn vertex_main(
#include declare_vertex_standard_params
) -> VertexOut
{
	var output : VertexOut;

	#include calculate_vertex_uv
	#include calculate_vertex_detail_uv
	#include calculate_vertex
	#include calculate_vertex_skinning
	#include calculate_vertex_projection
	#include calculate_vertex_color
	#include calculate_vertex_shadow_mapping
	#include calculate_vertex_standard
	#include calculate_vertex_log_depth

	output.vVertexPositionModelSpace = vertexPositionModelSpace;

	return output;
}

@fragment
fn fragment_main(fragInput: VertexOut) -> FragmentOutput
{
	#ifdef NO_DRAW
		discard;
	#endif
	var fragDepth: f32;
	var fragColor: vec4f;

	var diffuseColor: vec4f = vec4(1.0);
	#include calculate_fragment_color_map
	#include calculate_fragment_detail_map
	#include calculate_fragment_normal_map
	#include calculate_fragment_phong_exponent_map

	#include calculate_fragment_normal

	var phongMask: f32 = 1.0;
	#ifdef USE_NORMAL_MAP
		let tangentSpaceNormal: vec3f = mix(2.0 * texelNormal.xyz - 1.0, vec3(0, 0, 1), f32(uBaseMapAlphaPhongMask));
		#ifdef USE_COLOR_ALPHA_AS_PHONG_MASK
			phongMask = texelColor.a;
		#else
			phongMask = texelNormal.a;
		#endif
	#else
		let tangentSpaceNormal: vec3f = mix(2.0 * defaultNormalTexel.xyz - 1.0, vec3(0, 0, 1), f32(uBaseMapAlphaPhongMask));
		#ifdef USE_COLOR_ALPHA_AS_PHONG_MASK
			phongMask = texelColor.a;
		#endif
	#endif
	//float phongMask = mix(texelNormal.a, texelColor.a, float(uBaseMapAlphaPhongMask));
	fragmentNormalCameraSpace = normalize(TBNMatrixCameraSpace * tangentSpaceNormal);

	diffuseColor *= texelColor;
	#include calculate_fragment_alpha_test

	let albedo: vec3f = texelColor.rgb;
	#include source1_blend_tint
	#include calculate_fragment_cube_map

	var alpha: f32 = g_DiffuseModulation.a;
	#include source1_colormap_alpha


	alpha = alpha;//lerp(alpha, alpha * vVertexColor.a, g_fVertexAlpha);



	let fogFactor: f32 = 0.0;
	//gl_FragColor = FinalOutputConst(vec4(albedo, alpha), fogFactor, g_fPixelFogType, TONEMAP_SCALE_LINEAR, g_fWriteDepthToAlpha, worldPos_projPosZ.w );
	//gl_FragColor = FinalOutputConst( float4( result.rgb, alpha ), fogFactor, g_fPixelFogType, TONEMAP_SCALE_LINEAR, g_fWriteDepthToAlpha, i.worldPos_projPosZ.w );

	//if (gl_FragCoord.x < 400.) {
		//gl_FragColor = vec4(texelColor.rgb, 1.);
	//}
	/*if (length(floor((gl_FragCoord.xy + vec2(15.0)) / 30.0) * 30.0 - gl_FragCoord.xy) > 10.0) {
		discard;
	}*/
	//if (length(mod(gl_FragCoord.xy, vec2(2.0))) < 1.0) {
	//	discard;
	//}
	//gl_FragColor = vec4(albedo, alpha);
	//gl_FragColor.rgb = g_DiffuseModulation.rgb;


#ifdef USE_SHEEN_MAP
	//gl_FragColor.rgb = texture2D(sheenMaskTexture, vTextureCoord).rgb;
#endif



	#if defined(USE_DETAIL_MAP) && defined(DETAIL_BLEND_MODE)
		#if (DETAIL_BLEND_MODE == 0)
		//TODO
		#elif (DETAIL_BLEND_MODE == 1)
			fragColor = vec4f(fragColor.rgb + texelDetail.rgb * uDetailBlendFactor, fragColor.a);
		#elif (DETAIL_BLEND_MODE == 2)
		//TODO
		#elif (DETAIL_BLEND_MODE == 3) // TCOMBINE_FADE
			albedo = mix(albedo, texelDetail.rgb, uDetailBlendFactor);
		#endif
	#endif


/* TEST SHADING BEGIN*/
	#include calculate_lights_setup_vars



	var material: BlinnPhongMaterial;
	material.diffuseColor = albedo;//diffuseColor.rgb;//vec3(1.0);//diffuseColor.rgb;
	material.specularColor = vec3(phongMask);
#ifdef USE_PHONG_EXPONENT_MAP
	#ifdef USE_PHONG_ALBEDO_TINT
		material.specularColor = mix(vec3(1.0), texelColor.rgb, texelPhongExponent.g);
	#endif
	material.specularShininess = texelPhongExponent.r * phongUniforms.phongExponentFactor;
#else
	material.specularShininess = phongUniforms.phongBoost * phongUniforms.phongExponent;
#endif
	material.specularStrength = phongMask;
#ifdef SOURCE1_SPECULAR_STRENGTH
	material.specularStrength *= float(SOURCE1_SPECULAR_STRENGTH);
#endif

#include calculate_fragment_lights

/* TEST SHADING END*/

/* TEST SHADING BEGIN*/

var diffuse: vec3f = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
#include source1_calculate_selfillum


#ifdef USE_PHONG_SHADING
	fragColor = vec4(reflectedLight.directSpecular + diffuse, fragColor.a);
#else
	fragColor = vec4(diffuse, fragColor.a);
#endif
fragColor.a = alpha;

//gl_FragColor.rgb = vec3(phongMask);
/* TEST SHADING END*/
//gl_FragColor.rgb = texelPhongExponent.rgb;
//gl_FragColor.rgb = material.specularColor;
//gl_FragColor.rgb = vec3(texelColor.a);


#ifdef USE_CUBE_MAP
	#if defined(USE_NORMAL_MAP) && defined(USE_NORMAL_ALPHA_AS_ENVMAP_MASK)
		fragColor = vec4(fragColor.rgb + cubeMapColor.rgb * uCubeMapTint.rgb * texelNormal.a, fragColor.a);
	#else
		//gl_FragColor.rgb += cubeMapColor.rgb * uCubeMapTint.rgb * texelColor.a;
		fragColor = vec4(fragColor.rgb + cubeMapColor.rgb * uCubeMapTint.rgb * texelColor.a, fragColor.a);
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

	#include source1_calculate_sheen
	#include calculate_fragment_standard
	#include calculate_fragment_log_depth

	#if defined(USE_DETAIL_MAP) && defined(DETAIL_BLEND_MODE)
		#if (DETAIL_BLEND_MODE == 5)
		//TODO
		#elif (DETAIL_BLEND_MODE == 6)
			let f: f32 = uDetailBlendFactor - 0.5;
			let fMult: f32 = select(4.0 * uDetailBlendFactor, 1.0 / uDetailBlendFactor, (f >= 0.0));
			let fAdd: f32 = select(-0.5*fMult, 1.0-fMult, (f >= 0.0));
			fragColor = vec4(fragColor.rgb + saturate(fMult * texelDetail.rgb + fAdd), fragColor.a);
		#endif
	#endif

	#include output_fragment
}
