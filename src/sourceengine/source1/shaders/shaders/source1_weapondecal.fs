export default `
#ifndef DESATBASETINT
	#define DESATBASETINT 0
#endif
#ifndef ALPHAMASK
	#define ALPHAMASK 0
#endif
#ifndef THIRDPERSON
	#define THIRDPERSON 0
#endif
#ifndef HIGHLIGHT
	#define HIGHLIGHT 0
#endif
#ifndef PHONG
	#define PHONG 0
#endif
#ifndef USE_CUBE_MAP
	#define USE_CUBE_MAP 0
#endif
#ifndef PEEL
	#define PEEL 0
#endif
#ifndef CASCADED_SHADOW_MAPPING
	#define CASCADED_SHADOW_MAPPING 0
#endif
#ifndef DYN_CSM_ENABLED
	#define DYN_CSM_ENABLED 0
#endif
#ifndef NUM_LIGHTS
	#define NUM_LIGHTS 0
#endif

#if ( DESATBASETINT == 1 )
	const float3 g_desat = vec3(0.299, 0.587, 0.114);
#endif
#if (HIGHLIGHT > 0)
	#define			TAU									6.28318
	#define			ONE_OVER_SIXTEEN					0.0625
	#define			CSTRIKE_BLUE						float3( 0.204, 0.266, 0.343 )
#endif
#define			g_flScratchwidth					0.02



#include source1_fragment_common
#include declare_camera_position
#include declare_fragment_color_map
#include declare_fragment_normal_map
#include declare_fragment_phong_exponent_map
#if (THIRDPERSON == 0)
	#include declare_fragment_ao_map
	uniform sampler2D scratchesMap;
	uniform sampler2D grungeMap;
#endif

#if (DECALSTYLE == 3) // hologram
	uniform sampler2D holoMaskMap;
	uniform sampler2D holoSpectrumMap;
#endif


#include declare_fragment_cube_map

uniform vec3 uCubeMapTint;


uniform vec4 uWearParams;//g_fvConstRegister0
#define			g_flWearAmt							uWearParams.x
#define			g_flWearWidth						uWearParams.y
#define			g_flWearRemapped					uWearParams.z
#define			g_flUnWearStrength					uWearParams.w

uniform vec4 uPhongParams;//g_fvConstRegister1
#define			g_flPhongExponent					uPhongParams.x
#define			g_flPhongBoost						uPhongParams.y
#define			g_flPhongAlbedoBoost				uPhongParams.z
#define			g_flGrungeScale						uPhongParams.w

uniform vec4 uPhongFresnel;//g_fvConstRegister2
#define			g_fvPhongFresnelRanges				uPhongFresnel.xyz
#define			g_bPhongAlbedoTint					uPhongFresnel.w



uniform vec3 uColorTint;//m_nColorTint
uniform vec3 uColorTint2;//m_nColorTint2
uniform vec3 uColorTint3;//m_nColorTint3
uniform vec3 uColorTint4;//m_nColorTint4


uniform float uTintLerpBase;
#define			g_flTintLerpBase uTintLerpBase//g_fvConstRegister13

#if (HIGHLIGHT > 0) || (PEEL == 1)
	uniform vec2 uHighlight;//m_nHighlight, m_nHighlightCycle
	#define			g_flHighlightAmount					uHighlight.x
	#define			g_flHighlightCycle					uHighlight.y
#endif


#include source1_varying_weapondecal

void main(void) {
	#ifdef USE_COLOR_MAP
		float4 cOut = texture2D(colorMap, vTextureCoord.zw);
	#else
		float4 cOut = vec4(1.0);
	#endif

	#if ( DESATBASETINT == 1 )
		cOut.rgb = lerp( vec3(dot(g_desat.rgb, cOut.rgb)), cOut.rgb, g_flTintLerpBase );
	#endif

	#if ( ALPHAMASK == 1 )
		cOut.a = step( 0.1, cOut.a );
		cOut.rgb = vec3(cOut.a);
		cOut.a = 1.0;
		gl_FragColor = cOut;
		return;
	#endif

	#if ( THIRDPERSON == 1 )
		//clip off any pixels outside 0-1 UV space to prevent smearing edge pixels on lower mips
		//clip( (saturate( vTextureCoord.z ) != vTextureCoord.z) ? -1 : 1 );
		if ((saturate( vTextureCoord.z ) != vTextureCoord.z)) {
			discard;
		}
		//clip( (saturate( vTextureCoord.w ) != vTextureCoord.w) ? -1 : 1 );
		if ((saturate( vTextureCoord.w ) != vTextureCoord.w)) {
			discard;
		}
	#endif

	//alpha values above 0.1 locally decrease wear to retain important areas of the sticker
	float flUnWearImportance = g_flUnWearStrength * ( 1.0 - cOut.a );

	//semi-on/off alpha
	cOut.a = step( 0.1, cOut.a );
	#if (HIGHLIGHT == 0) && (PEEL == 0)
		//clip( cOut.a - 0.001 );
		if (cOut.a < 0.001) {
			discard;
		}
	#endif

	#if (DECALSTYLE != 2) // non-color-replace logos can still be color tinted by the first color tint value

		#if (DESATBASETINT == 1)
			cOut.rgb = lerp( cOut.rgb * (uColorTint / 255.0), cOut.rgb, cOut.g * g_flTintLerpBase );
		#else
			cOut.rgb *= (uColorTint / 255.0);
		#endif

	#endif

	#if (PHONG == 1)
		// default to numerically defined specular values
		float4 fvSpecularExponent = float4( g_flPhongExponent, g_bPhongAlbedoTint, 0.0, 1.0 );
		#ifdef USE_PHONG_EXPONENT_MAP
			// override the existing specular exponent values with values from the exponent map
			fvSpecularExponent.xy = tex2D( phongExponentTexture, vTextureCoord.xy ).xy;
		#endif
	#endif

	//float3 vWorldPos = i.worldPos;
#define vWorldPos vVertexPositionWorldSpace.xyz
	float3 vEyeDir = normalize( uCameraPosition - vWorldPos );

	#if ( (DECALSTYLE == 4) || ( DECALSTYLE == 5 ) )// foil emboss uses normal map
		float4 vNormalTexel = tex2D(normalMap, vTextureCoord.zw * vec2(1.0, -1.0));//I don't know why we have to inverse y axis
		float3 vTangentSpaceNormal = 2.0 * vNormalTexel.xyz - 1.0;

		vec3 fragmentNormalWorldSpace = normalize(vVertexNormalWorldSpace.xyz);
		vec3 fragmentTangentWorldSpace = normalize(vVertexTangentWorldSpace.xyz);
		vec3 fragmentBitangentWorldSpace = normalize(vVertexBitangentWorldSpace.xyz);
		mat3 TBNMatrixWorldSpace = mat3(fragmentTangentWorldSpace, fragmentBitangentWorldSpace, fragmentNormalWorldSpace);


		float3 vWorldNormal = normalize( (TBNMatrixWorldSpace/* (float3x3)i.tangentSpaceTranspose*/ * vTangentSpaceNormal ) );
		#if ( DECALSTYLE == 5)
			// flatten the normal for anisotropic spec to reduce aliasing
			float3 vSpecNormal = normalize( (TBNMatrixWorldSpace/* (float3x3)i.tangentSpaceTranspose*/ * lerp( vTangentSpaceNormal, float3( 0.0, 0.0, 1.0 ), 0.95 ) ) );
		#endif
	#else
		float3 vWorldNormal = normalize ( vVertexNormalWorldSpace.xyz );
	#endif

	#if (DECALSTYLE == 2) // color-replace logo
		cOut.rgb = lerp( lerp( lerp( (uColorTint / 255.0), (uColorTint2 / 255.0), cOut.r ), (uColorTint3 / 255.0), cOut.g ), (uColorTint4 / 255.0), cOut.b );
	#endif

	#if (DECALSTYLE == 3) // hologram
		float3 fvHoloMask = tex2D( holoMaskMap, vTextureCoord.zw ).rgb;

		#if (NUM_LIGHTS > 0)
			float2 fvSpectrumUV = float2( fvHoloMask.g + dot( vEyeDir, vWorldNormal ), fvHoloMask.b );
			float3 fvlightdir0 = normalize(cLightInfo[0].pos.xyz - vWorldPos);
			fvSpectrumUV.x += dot( vEyeDir, fvlightdir0 );
		#else
			float2 fvSpectrumUV = float2( fvHoloMask.g + dot( vEyeDir + vWorldNormal, float3( 0, 1, 0 ) ), fvHoloMask.b );
		#endif

		float3 fvHoloSpectrumSrc = tex2D( holoSpectrumMap, fvSpectrumUV ).rgb;
		cOut.rgb = lerp( cOut.rgb, fvHoloSpectrumSrc, fvHoloMask.r );
	#endif

	// lighting
	#if ( (CASCADED_SHADOW_MAPPING == 1) && (DYN_CSM_ENABLED == 1) )
		float flCSMShadow = CSMComputeShadowing( vWorldPos );
	#else
		float flCSMShadow = 1.0;
	#endif

	//float3 linearColor = PixelShaderDoLighting( vWorldPos, vWorldNormal, float3( 0.1, 0.1, 0.1), false, true, i.lightAtten, g_cAmbientCube, NormalizeSampler, NUM_LIGHTS, cLightInfo, false, false, NULL, flCSMShadow );//TODO
	vec3 linearColor = vec3(1.0);

	#ifdef USE_CUBE_MAP
		float3 vReflect = CalcReflectionVectorUnnormalized( vWorldNormal, vEyeDir );
		float3 envMapColor = ENV_MAP_SCALE * texCUBE( cubeTexture, vReflect ).rgb * uCubeMapTint;
		// TODO: envmap fresnel
		#if (DECALSTYLE == 4)
			envMapColor *= cOut.rgb * linearColor.rgb;
		#endif
	#endif

	#if (PHONG == 1)
		float3 specularLighting, rimLighting;
		float fFresnelRanges = Fresnel( vWorldNormal, vEyeDir, g_fvPhongFresnelRanges );
		#if ( DECALSTYLE == 5)
			float3 vTangentS = float3( i.tangentSpaceTranspose[0][0], i.tangentSpaceTranspose[1][0], i.tangentSpaceTranspose[2][0] );
			vTangentS = normalize( mul( (float3x3)i.tangentSpaceTranspose, vTangentS ) );
			float3 vTangentT = float3( i.tangentSpaceTranspose[0][1], i.tangentSpaceTranspose[1][1], i.tangentSpaceTranspose[2][1] );
			vTangentT = normalize( mul( (float3x3)i.tangentSpaceTranspose, vTangentT ) );

			vTangentS = normalize( cross( vSpecNormal, vTangentT ) );
			vTangentT = normalize( cross( vSpecNormal, vTangentS ) );

			float4 vAnisoDirSample = tex2D( AnisoDirSampler, vTextureCoord.zw );
			float2 vAnisoDir = vAnisoDirSample.yx * 2.0 - 1.0;

			//PixelShaderDoAnisotropicSpecularLighting( vWorldPos, vWorldNormal, vTangentS, vTangentT, fvSpecularExponent.r * 255.0, vEyeDir, i.lightAtten, NUM_LIGHTS, cLightInfo, fFresnelRanges, vAnisoDir, 1.0, specularLighting );
			//TODO

			rimLighting = 0.0;

			specularLighting *= vAnisoDirSample.a;
		#else
			//PixelShaderDoSpecularLighting( vWorldPos, vWorldNormal, fvSpecularExponent.r * 255.0, vEyeDir, i.lightAtten, NUM_LIGHTS, cLightInfo, false, NULL, fFresnelRanges, false, 1.0, 1.0, specularLighting, rimLighting );
			//TODO
		#endif

		specularLighting *= max( vec3(g_flPhongBoost), fvSpecularExponent.g * g_flPhongAlbedoBoost ) * cOut.rgb ;
		//specularLighting *= lerp( g_flPhongBoost.xxx, g_flPhongAlbedoBoost * cOut.rgb, fvSpecularExponent.g );
		//specularLighting *= g_flPhongBoost;

		#if ( DECALSTYLE != 5 )
			specularLighting *= cOut.a * fFresnelRanges; // specular mask
		#endif
	#endif

	#if ( THIRDPERSON == 0 )

		//sample ao
		#ifdef USE_AO_MAP
			float4 fvAOSrc = tex2D( aoMap, vTextureCoord.xy );
		#else
			float4 fvAOSrc = vec4(1.0);
		#endif

		//apply scratches and grunge

		//sample cavity and ao
		float4 fvScratchesSrc = tex2D( scratchesMap, vTextureCoord.xy * 0.5 );
		float4 fvGrungeSrc = tex2D( grungeMap, vTextureCoord.zw * g_flGrungeScale );
		float cavity = 1.0 - fvAOSrc.r * fvAOSrc.g * fvScratchesSrc.g;

		//apply uniform grunge
		cOut.rgb = lerp( cOut.rgb, cOut.rgb * fvGrungeSrc.rgb, g_flWearAmt * 0.7 );

		float flLocalRemappedWear = g_flWearRemapped - flUnWearImportance;

		float alphaWearPoint = saturate( flLocalRemappedWear - g_flWearWidth );

		//fast wear vertical threshold
		//float flFastWearThresholdValue = step( g_flFastWearThreshold, vTextureCoord.w ) * g_flWearAmt * 2.0;
		//alphaWearPoint += flFastWearThresholdValue;
		//flLocalRemappedWear += flFastWearThresholdValue;

		#if (DECALSTYLE == 4)
			//foil embossed labels have hard wear edges
			cOut.a *= step( alphaWearPoint + g_flScratchwidth, cavity );
		#else
			cOut.a *= smoothstep( alphaWearPoint - g_flScratchwidth, alphaWearPoint + g_flScratchwidth, cavity );
		#endif

		#if ( DECALSTYLE == 1 || DECALSTYLE == 3 ) //paper-backed or holographic (which is also paper-backed)
			// wear down color to white paper backing
			float colorWear = smoothstep( flLocalRemappedWear - g_flScratchwidth, flLocalRemappedWear + g_flScratchwidth, cavity );
			cOut.rgb = lerp( fvGrungeSrc.rgb, cOut.rgb, colorWear );
		#endif

		#if ( ( DECALSTYLE != 4 ) && ( DECALSTYLE != 5 ) ) //foil stickers don't lose their shine
			// wear down spec and envmap
			#if (PHONG == 1 || defined(USE_CUBE_MAP))
				float specWearPoint = saturate( flLocalRemappedWear + g_flWearWidth );
				float specWear = smoothstep( specWearPoint - g_flScratchwidth, specWearPoint + g_flScratchwidth, cavity );
				#if (PHONG == 1)
					specularLighting *= specWear;
				#endif
				#ifdef USE_CUBE_MAP
					envMapColor *= specWear;
				#endif
			#endif
		#endif

	#endif //THIRDPERSON == 0

	#if ( DECALSTYLE == 5 ) // color burn lighting for extra saturation
		cOut.rgb = lerp( cOut.rgb * cOut.rgb * cOut.rgb, cOut.rgb, linearColor );
	#endif

	#if (PHONG == 1)
		cOut.rgb += specularLighting;
	#endif

	// apply lighting
	cOut.rgb *= linearColor;

	#ifdef USE_CUBE_MAP
		cOut.rgb += envMapColor;
	#endif

	#if ( THIRDPERSON == 0 )
		//secondary blurred ao
		cOut.rgb *= lerp( 1.0, fvAOSrc.b, g_flWearAmt * 0.35 );

		//apply AO
		cOut.rgb *= fvAOSrc.g;
	#endif //THIRDPERSON == 0

	#if ( HIGHLIGHT > 0 )
		// cheap highlighting base pass
		float flModdedCycle = fmod( 0.5 * vTextureCoord.x + vTextureCoord.y + g_flHighlightCycle, 1.5 );
		flModdedCycle = smoothstep( 0.2, 0.6, abs( flModdedCycle - 0.5 ) );

		#ifdef USE_CUBE_MAP
			vReflect.r += flModdedCycle;
			float3 envMapColorSelect = texCUBE( cubeTexture, vReflect ).rgb * HDR_INPUT_MAP_SCALE;
			float3 selectionColor = max( 4.0*envMapColorSelect.rgb, CSTRIKE_BLUE );
		#else
			float3 selectionColor = max( 4.0*cOut.rgb, CSTRIKE_BLUE );
		#endif

		cOut.rgb = lerp( cOut.rgb, selectionColor, flModdedCycle * g_flHighlightAmount );

	#endif

	#if ( HIGHLIGHT == 2)

		//also do expensive edge detection
		float flEdgeAlphaDetect = 0.0;

		float2 offsets[16] = {
			float2( 1.0, 0.0 ),
			float2( 0.9211, 0.3894 ),
			float2( 0.6967, 0.7174 ),
			float2( 0.3624, 0.932 ),
			float2( -0.0292, 0.9996 ),
			float2( -0.4161, 0.9093 ),
			float2( -0.7374, 0.6755 ),
			float2( -0.9422, 0.335 ),
			float2( -0.9983, -0.0584 ),
			float2( -0.8968, -0.4425 ),
			float2( -0.6536, -0.7568 ),
			float2( -0.3073, -0.9516 ),
			float2( 0.0875, -0.9962 ),
			float2( 0.4685, -0.8835 ),
			float2( 0.7756, -0.6313 ),
			float2( 0.9602, -0.2794 ),
		};

		for ( int k = 0; k < 16; k++ )
		{
			float flAlphaTap = tex2D( BaseSampler, vTextureCoord.zw + offsets[k] * 0.015 ).a;
			flEdgeAlphaDetect += step( 0.1, flAlphaTap );
		}

		flEdgeAlphaDetect = step( abs( (flEdgeAlphaDetect * ONE_OVER_SIXTEEN) - 0.5 ), 0.499 );

		cOut = lerp( cOut, float4(selectionColor, 1), flEdgeAlphaDetect * g_flHighlightAmount );

	#endif

	#if ( PEEL == 1 )
		//sticker peeling application effect in 2D
		float invHighlight = 1.0 - g_flHighlightAmount;
		float distort = pow( (invHighlight - vTextureCoord.x), 0.3 ) * 0.3;

		float2 backingUV = float2(invHighlight + (invHighlight - vTextureCoord.x), vTextureCoord.y );

		//fake vertical parallax
		float flParallaxY = dot( float3(0,0,1), vWorldNormal );
		backingUV.y += (flParallaxY * distort );

		#ifdef USE_COLOR_MAP
			float4 flBackingSample = tex2D( colorMap, backingUV );
		#else
			float4 flBackingSample = vec4(1.0);
		#endif

		//desaturate backing sample
		flBackingSample.rgb = vec3(dot( flBackingSample.rgb, float3(0.299,0.587,0.114) ));

		distort = smoothstep( 0.01, 0.2, distort);
		flBackingSample.rgb = lerp( flBackingSample.rgb, vec3(0.5), vec3(0.2) ) * distort;
		flBackingSample.a = step( 0.1, flBackingSample.a );

		//if ( flBackingSample.a > 0 && vTextureCoord.x < invHighlight )
		//{
		//	cOut.rgb = flBackingSample.rgb;
		//	float edgeFade = smoothstep( 0.0, 0.2, min( vTextureCoord.x, vTextureCoord.y ) );
		//	cOut.a = max( cOut.a, edgeFade );
		//}
		//becomes:
		cOut = lerp( cOut,
			   float4( flBackingSample.rgb, max( cOut.a, smoothstep( 0.0, 0.2, min( vTextureCoord.x, vTextureCoord.y ) ) ) ),
			   step( vTextureCoord.x, invHighlight ) * flBackingSample.a );

		//if ( vTextureCoord.x > invHighlight )
		//{
		//	cOut.rgb = 0;
		//	cOut.a *= (1.0 - distort) * 0.8;
		//}
		//becomes:
		cOut = lerp( cOut, float4( 0, 0, 0, cOut.a * (1.0 - distort) * 0.8 ), step( invHighlight, vTextureCoord.x ) );

	#endif

	//return FinalOutput( cOut, 0, PIXEL_FOG_TYPE_NONE, TONEMAP_SCALE_LINEAR );
	#ifdef USE_COLOR_MAP
		//cOut = texture2D(colorMap, vTextureCoord.xy);
	#endif
	gl_FragColor = cOut;



	/*#if (USE_CUBE_MAP == 1)
		vReflect = CalcReflectionVectorUnnormalized( vWorldNormal, vEyeDir );
		envMapColor = texCUBE( cubeTexture, vEyeDir ).rgb;
		gl_FragColor.rgb = envMapColor;
		gl_FragColor.a = 1.0;
	#endif*/
	//#include source1_compute_selfillum
	#include compute_fragment_standard
}
`;
