export default `
#define PAINT_STYLE_NONE 0
#define PAINT_STYLE_SOLID 1
#define PAINT_STYLE_HYDROGRAPHIC 2
#define PAINT_STYLE_SPRAY 3
#define PAINT_STYLE_ANODIZED 4
#define PAINT_STYLE_ANODIZED_MULTI 5
#define PAINT_STYLE_ANODIZED_AIR 6
#define PAINT_STYLE_CUSTOM 7
#define PAINT_STYLE_ANTIQUED 8
#define PAINT_STYLE_GUNSMITH 9

#ifndef PAINT_STYLE
	#define PAINT_STYLE 0
#endif
#ifndef EXPONENTMODE
	#define EXPONENTMODE 0
#endif
#ifndef PREVIEW
	#define PREVIEW 1
#endif
#ifndef CHEAPMODE
	#define CHEAPMODE 0
#endif
#ifndef PHONGALBEDOFACTORMODE
	#define PHONGALBEDOFACTORMODE 0
#endif
#ifndef PREVIEWPHONGALBEDOTINT
	#define PREVIEWPHONGALBEDOTINT 1
#endif
#include source1_fragment_common
#include declare_camera_position
const vec4 defaultNormalTexel = vec4(0.5, 0.5, 1.0, 1.0);

uniform vec3 phongfresnelranges;

#include declare_fragment_color_map
#include declare_fragment_normal_map
#include declare_fragment_exponent_map
#include declare_fragment_alpha_test
#include declare_fragment_mask_map
#include source1_declare_phong
#include source1_declare_sheen
#include source1_declare_selfillum
#include declare_fragment_cube_map
#ifdef USE_PATTERN_MAP
	uniform sampler2D patternMap;
#endif
#include declare_fragment_ao_map
#ifdef USE_SCRATCHES_MAP
	uniform sampler2D scratchesMap;
#endif
#ifdef USE_GRUNGE_MAP
	uniform sampler2D grungeMap;
#endif
#ifdef USE_SURFACE_MAP
	uniform sampler2D surfaceMap;
#endif
#ifdef USE_POS_MAP
	uniform sampler2D posMap;
#endif

#if ((PAINT_STYLE == PAINT_STYLE_SPRAY) || (PAINT_STYLE == PAINT_STYLE_ANODIZED_AIR))
	uniform vec4 g_patternTexCoordTransform[2];
#endif


uniform vec4 g_ShaderControls;
#define g_fPixelFogType					g_ShaderControls.x
#define g_fWriteDepthToAlpha			g_ShaderControls.y
#define g_fWriteWaterFogToDestAlpha		g_ShaderControls.z
#define g_fVertexAlpha					g_ShaderControls.w

uniform vec4 g_DiffuseModulation;
uniform vec3 uCubeMapTint;
uniform float uBlendTintColorOverBase;
uniform float uWearProgress;
#define g_flWearAmt uWearProgress//TODO: manually replace

#include source1_final_output_const

#include declare_lights

/*********/
//customization

uniform vec3 uCamoColor0;
uniform vec3 uCamoColor1;
uniform vec3 uCamoColor2;
uniform vec3 uCamoColor3;
#define g_cCamo0 uCamoColor0
#define g_cCamo1 uCamoColor1
#define g_cCamo2 uCamoColor2
#define g_cCamo3 uCamoColor3
/*********/
/*vec4 triplanarPatternColor(vec3 posColor) {
	vec4 color;
	float mXY = abs(normalVector.z);
	float mXZ = abs(normalVector.y);
	float mYZ = abs(normalVector.x);


	float total = mXY + mXZ + mYZ;
	mXY /= total;
	mXZ /= total;
	mYZ /= total;

	vec2 scale = vec2(1.0/16.0);
	vec2 t1 = v.xy * scale + uPatternOffset;
	vec2 t2 = v.xz * scale + uPatternOffset;
	vec2 t3 = v.yz * scale + uPatternOffset;

	vec2 c1,c2,c3;

	c1.s = t1.s*cos(uPatternRotate)-t1.t*sin(uPatternRotate);
	c1.t = t1.t*cos(uPatternRotate)+t1.s*sin(uPatternRotate);
	c2.s = t2.s*cos(uPatternRotate)-t2.t*sin(uPatternRotate);
	c2.t = t2.t*cos(uPatternRotate)+t2.s*sin(uPatternRotate);
	c3.s = t3.s*cos(uPatternRotate)-t3.t*sin(uPatternRotate);
	c3.t = t3.t*cos(uPatternRotate)+t3.s*sin(uPatternRotate);

	vec4 cXY = texture2D(detailTexture, c1);
	vec4 cXZ = texture2D(detailTexture, c2);
	vec4 cYZ = texture2D(detailTexture, c3);

	color = cXY*mXY + cXZ*mXZ + cYZ*mYZ;
	return cYZ * (abs(mYZ)+abs(mXZ)) + cXY * mXY;//side good
	return color;
}*/

#define		 g_flBlendYPow			7.0
#define		 g_flBlendZPow			7.0
#define		 g_flAnodizedBaseExponent 0.004
#define		 g_flAnodizedBasePhongIntensity 1.0
#define		 g_cAnodizedBase		vec3(0.05)

#define		 g_flPhongAlbedoFactor	 1.0//g_fvPhongSettings_wear.x//TODO
#define		 g_flPaintExponent		 1.0//g_fvPhongSettings_wear.y
#define		 g_flPaintPhongIntensity 1.0//g_fvPhongSettings_wear.z

uniform vec4 g_PreviewPhongBoosts;
#define  g_PreviewPhongAlbedoBoost	1.0//	g_PreviewPhongBoosts.x//TODO
#define  g_PreviewPhongBoost		1.0//	g_PreviewPhongBoosts.y
#define  g_PreviewPatternScale		g_PreviewPhongBoosts.z

#include source1_varying_customweapon

#define uBaseMapAlphaPhongMask 0//TODO: set proper uniform

void main(void) {
	float4 cOut = vec4(0.0, 0.0, 0.0, 1.0);
	#include compute_fragment_ao_map
#define fvAoSrc texelAo//TODO: manually replace
	float flCavity = texelAo.r;
	float flPaintBlend = fvAoSrc.a;

	#ifdef USE_SCRATCHES_MAP
		vec4 texelScratches = texture2D(scratchesMap, vTexture2Coord.xy);
	#else
		vec4 texelScratches = vec4(1.0);
	#endif
#define flPaintWear	texelScratches.g//TODO: manually replace

	#ifdef USE_PATTERN_MAP
		vec4 texelPattern = texture2D(patternMap, vTextureCoord.zw);
	#else
		vec4 texelPattern = vec4(1.0);
	#endif
#define fvPattern texelPattern//TODO: manually replace

	#include compute_fragment_mask1_map
#define fvMasks texelMask1//TODO: manually replace

	#include compute_fragment_exponent_map
#define cExp texelExponent//TODO: manually replace
#define cOrigExp texelExponent//TODO: manually replace

	#if (PAINT_STYLE != PAINT_STYLE_ANTIQUED)
		flPaintBlend += flPaintWear * flCavity;
		flPaintBlend *= g_flWearAmt * 6.0 + 1.0;
		#if ((PAINT_STYLE == PAINT_STYLE_HYDROGRAPHIC) || (PAINT_STYLE == PAINT_STYLE_ANODIZED_MULTI) || (PAINT_STYLE == PAINT_STYLE_CUSTOM) || (PAINT_STYLE == PAINT_STYLE_GUNSMITH)) // Paint patterns and durability
			float flCuttableArea = 1.0;
			#if ((PAINT_STYLE == PAINT_STYLE_HYDROGRAPHIC) || (PAINT_STYLE == PAINT_STYLE_ANODIZED_MULTI))
				flCuttableArea = 1.0 - saturate(fvMasks.g + fvMasks.b);
			#endif
			// cut through
			flPaintBlend += smoothstep(0.5, 0.6, fvPattern.a) * smoothstep(1.0, 0.9, fvPattern.a);
			#if (PAINT_STYLE == PAINT_STYLE_ANODIZED_MULTI)
				// rescale the alpha to represent exponent in the range of 0-255 and let the cutout mask area fall off the top end
				fvPattern.a = saturate(fvPattern.a * 2.0);
			#elif (PAINT_STYLE == PAINT_STYLE_GUNSMITH)
				flPaintBlend *= max (1.0 - flCuttableArea, smoothstep(0.0, 0.5, fvPattern.a));
				// rescale the alpha to represent exponent in the range of 0-255 and let the cutout mask area fall off the top end
				fvPattern.a = lerp(fvPattern.a, saturate(fvPattern.a * 2.0), fvMasks.r);
				// indestructible paint
			#else
				// indestructible paint
				flPaintBlend *= max (1.0 - flCuttableArea, smoothstep(0.0, 0.5, fvPattern.a));
			#endif
		#endif//#if ((PAINT_STYLE == PAINT_STYLE_HYDROGRAPHIC) || (PAINT_STYLE == PAINT_STYLE_ANODIZED_MULTI) || (PAINT_STYLE == PAINT_STYLE_CUSTOM) || (PAINT_STYLE == PAINT_STYLE_GUNSMITH))
		#if (((EXPONENTMODE == 1) || (PREVIEW == 1)) && ((PAINT_STYLE == PAINT_STYLE_ANODIZED) || (PAINT_STYLE == PAINT_STYLE_ANODIZED_MULTI) || (PAINT_STYLE == PAINT_STYLE_ANODIZED_AIR )))
			float flPaintExpBlend = smoothstep( 0.99, 1.0, flPaintBlend );
		#else
			float flPaintExpBlend = flPaintBlend;
		#endif
	#elif ((EXPONENTMODE == 1) || (PREVIEW == 1))
		float flPaintExpBlend = flPaintBlend;
	#endif//#if (PAINT_STYLE != 8)

	#if ( ( PAINT_STYLE == PAINT_STYLE_HYDROGRAPHIC ) || ( PAINT_STYLE == PAINT_STYLE_SPRAY ) ) // paint wears off in layers
		vec3 fvPaintEdges = vec3(1.0);
		float3 spread = vec3(0.06) * g_flWearAmt; // spread of partially worn paint increases as the gun becomes more worn
		spread.y *= 2.0;
		spread.z *= 3.0;

		fvPaintEdges.x = smoothstep ( 0.58, 0.56 - spread.x, flPaintBlend );
		fvPaintEdges.y = smoothstep ( 0.56 - spread.x, 0.54 - spread.y, flPaintBlend );
		fvPaintEdges.z = smoothstep ( 0.54 - spread.y, 0.52 - spread.z, flPaintBlend );
	#endif

	#if ( ( PAINT_STYLE != 8 ) && ( PAINT_STYLE != 9 ) )
		flPaintBlend = smoothstep( 0.58, 0.68, flPaintBlend );
	#elif ( PAINT_STYLE == PAINT_STYLE_GUNSMITH )
		flPaintBlend = lerp( smoothstep( 0.58, 0.68, flPaintBlend ), flPaintBlend, fvMasks.r );
	#endif

	#if ( ( PAINT_STYLE == PAINT_STYLE_ANODIZED ) || ( PAINT_STYLE == PAINT_STYLE_ANODIZED_MULTI ) || ( PAINT_STYLE == PAINT_STYLE_ANODIZED_AIR ) ) // Anodized paint scratches through uncolored base coat
		float flPaintEdges = smoothstep ( 0.0, 0.01, flPaintBlend );
	#endif


	// ------------------------------------------------------------------------------------------------------
	// Exponent texture
	// ------------------------------------------------------------------------------------------------------
	#if ( ( EXPONENTMODE == 1 ) || ( PREVIEW == 1 ) )
		//float4 cExp = tex2D( ExponentSampler, i.vBaseUV_PatternUV.xy );
		#if ( ( PREVIEW == 1 ) && ( PREVIEWPHONGALBEDOTINT == 0 ) )
			cExp.g = 0.0;
		#endif
		float4 cPaintExp = cExp;

		#if ( ( PAINT_STYLE == PAINT_STYLE_ANODIZED ) || ( PAINT_STYLE == PAINT_STYLE_ANODIZED_MULTI ) || ( PAINT_STYLE == PAINT_STYLE_ANODIZED_AIR ) || ( PAINT_STYLE == PAINT_STYLE_ANTIQUED ) || ( PAINT_STYLE == PAINT_STYLE_GUNSMITH ) ) // Anodized/metallic
			#if ( PAINT_STYLE == PAINT_STYLE_ANTIQUED )
				flPaintBlend = 1.0 - step( flPaintExpBlend, 0.996 ) * fvMasks.r;
			#elif ( PAINT_STYLE == PAINT_STYLE_GUNSMITH )
				flPaintBlend = lerp( flPaintBlend, 1.0 - step( flPaintExpBlend, 0.996 ), fvMasks.r );
			#else
				flPaintBlend = saturate( 1.0 + flPaintExpBlend - fvMasks.r );
			#endif

			// exponent
			#if ( PAINT_STYLE == PAINT_STYLE_ANODIZED_MULTI )
				float flPatternExponentBlend = max( max( fvMasks.g, fvMasks.b ), flPaintBlend );
				cPaintExp.r = lerp( fvPattern.a, cExp.r, flPatternExponentBlend );
			#elif ( PAINT_STYLE == PAINT_STYLE_GUNSMITH )
				cPaintExp.r = lerp( g_flPaintExponent, fvPattern.a, fvMasks.r );
				cPaintExp.r = lerp( cPaintExp.r, cExp.r, flPaintBlend );
			#else
				cPaintExp.r = lerp( g_flPaintExponent, cExp.r, flPaintBlend );
			#endif

			// phongalbedo
			#if ( PAINT_STYLE == PAINT_STYLE_GUNSMITH )
				cPaintExp.g = saturate( fvMasks.r + flPaintBlend * cExp.g );
			#else
				cPaintExp.g = lerp ( 1.0, cExp.g, flPaintBlend );
			#endif

			cPaintExp.a = 1.0;
		#else // Everything else not anodized
			cPaintExp = lerp ( float4( g_flPaintExponent, 0.0, 0.0, 1.0 ), cExp, flPaintBlend );
			cPaintExp.a = 1.0;
		#endif

		#if ( PREVIEW == 0 )
			cOut = cPaintExp;
		#endif
	#endif


	// ------------------------------------------------------------------------------------------------------
	// Diffuse texture
	// ------------------------------------------------------------------------------------------------------
	#if ( ( EXPONENTMODE == 0 ) || ( PREVIEW == 1 ) )
		#include compute_fragment_color_map
		#ifndef USE_COLOR_MAP//TODO: probably not the best way to do that. We should remove all texelColor if no colorMap
			vec4 texelColor = vec4(1.0);
		#endif
#define cBase texelColor
		//float4 cBase = tex2D( BaseSampler, i.vBaseUV_PatternUV.xy );

		float3 cPaint = g_cCamo0;

		// ambient occlusion
		float flAo = fvAoSrc.g;

		// apply grunge to paint only in creases
		//float4 cGrunge = tex2D( GrungeSampler, i.vWearUV_GrungeUV.zw );
		#ifdef USE_GRUNGE_MAP
			vec4 texelGrunge = texture2D(grungeMap, vTexture2Coord.zw);
		#else
			vec4 texelGrunge = vec4(0.0);
		#endif
#define cGrunge texelGrunge//TODO: manually replace
		#if ( ( PAINT_STYLE == PAINT_STYLE_ANTIQUED ) || ( PAINT_STYLE == PAINT_STYLE_GUNSMITH ) )
			float flGrunge = cGrunge.r * cGrunge.g * cGrunge.b;
		#endif
		cGrunge = lerp( vec4(1.0), cGrunge, ( pow( ( 1.0 - flCavity ), 4.0 ) * 0.25 + 0.75 * g_flWearAmt ) );

		// ------------------------------------------------------------------------------------------------------
		// Solid style
		// ------------------------------------------------------------------------------------------------------
		#if ( PAINT_STYLE == PAINT_STYLE_SOLID )
			// apply color in solid blocks using masking from the part kit MasksSampler
			cPaint = lerp( cPaint, g_cCamo1, fvMasks.r );
			cPaint = lerp( cPaint, g_cCamo2, fvMasks.g );
			cPaint = lerp( cPaint, g_cCamo3, fvMasks.b );
		#endif

		// ------------------------------------------------------------------------------------------------------
		// Hydrographic/anodized multicolored style
		// ------------------------------------------------------------------------------------------------------
		#if ( ( PAINT_STYLE == PAINT_STYLE_HYDROGRAPHIC ) || ( PAINT_STYLE == PAINT_STYLE_ANODIZED_MULTI ) )
			// create camo using pattern
			cPaint = lerp( lerp( lerp( g_cCamo0, g_cCamo1, fvPattern.r ), g_cCamo2, fvPattern.g ), g_cCamo3, fvPattern.b );

			// apply any masking from the last two masks from MasksSampler, allowing some areas to be solid color
			cPaint = lerp( cPaint, g_cCamo2, fvMasks.g );
			cPaint = lerp( cPaint, g_cCamo3, fvMasks.b );
		#endif

		// ------------------------------------------------------------------------------------------------------
		// Spraypaint/anodized airbrushed style
		// ------------------------------------------------------------------------------------------------------
		#if ( ( PAINT_STYLE == PAINT_STYLE_SPRAY ) || ( PAINT_STYLE == PAINT_STYLE_ANODIZED_AIR ) )
			// apply spraypaint via box map based on mesh's object-space position as stored in the position pmap
			//float4 fvNormalSrc = tex2D( NormalsSampler, i.vBaseUV_PatternUV.xy );
			#ifdef USE_SURFACE_MAP
				vec4 texelSurface = texture2D(surfaceMap, vTextureCoord.xy);
			#else
				vec4 texelSurface = vec4(1.0);//this is probably wrong. we should never enter here anyway
			#endif
#define fvNormalSrc texelSurface//TODO: manually replace

			float2 fvPosCoord = float2( vTextureCoord.x, 1.0 - vTextureCoord.y );

			float4 fvPos = float4( 0.0, 0.0, 0.0, 0.0 );

			#if ( CHEAPMODE == 0 ) // if supersampling is not disabled
				//super sampling of position map
				float2 offsets[17];
				offsets[ 0] = float2( -0.00107234 ,-0.00400203 );
				offsets[ 1] = float2( 0.00195312, -0.00338291 ),
				offsets[ 2] = float2( 0.00400203, -0.00107234 ),
				offsets[ 3] = float2( -0.000714896, -0.00266802 ),
				offsets[ 4] = float2( 0.000976565, -0.00169146 ),
				offsets[ 5] = float2( 0.00266802, -0.000714896 );
				offsets[ 6] = float2( -0.00338291, -0.00195312 );
				offsets[ 7] = float2( -0.00169146, -0.000976565 );
				offsets[ 8] = float2( 0.0, 0.0 );
				offsets[ 9] = float2( 0.00169146, 0.000976565 );
				offsets[10] = float2( 0.00338291, 0.00195312 );
				offsets[11] = float2( -0.00266802, 0.000714896 );
				offsets[12] = float2( -0.000976565, 0.00169146 );
				offsets[13] = float2( 0.000714896, 0.00266802 );
				offsets[14] = float2( -0.00400203, 0.00107234 );
				offsets[15] = float2( -0.00195312, 0.00338291 );
				offsets[16] = float2( 0.00107234, 0.00400203 );
				for ( int k = 0; k < 17; k++ )
				{
					#ifdef USE_POS_MAP
						//fvPos += tex2D( OSPosSampler, fvPosCoord + offsets[k] ) * 0.05882353;
						fvPos += texture2D( posMap, fvPosCoord + offsets[k] ) * 0.05882353;// 1/17
					#endif

				}
			#else
				fvPos = texture2D( posMap, fvPosCoord );
			#endif

			//extract integer HDR values out from the RGBA vtf
			//developer.valvesoftware.com/wiki/Valve_Texture_Format#HDR_compression
			fvPos.rgb = (fvPos.rgb * (fvPos.a * 16.0) );

			float3 fvNormal = normalize( fvNormalSrc.xyz * 2.0 - 1.0 );

			// Project the mask in object-space x, y and z
			float2 flCoord;


			#if ( PREVIEW == 1 )

				// apply the preview pattern scale to only the scale portion of the pattern transform.

				mat2 tempMatrix = mat2(g_PreviewPatternScale, 0, 0, g_PreviewPatternScale);
				mat2 tempMatrix2 = mat2(g_patternTexCoordTransform[0].xy, g_patternTexCoordTransform[1].xy);
				tempMatrix = tempMatrix * tempMatrix2;

				flCoord.x = dot( fvPos.yz, tempMatrix[0] ) + g_patternTexCoordTransform[0].w;
				flCoord.y = dot( fvPos.yz, tempMatrix[1] ) + g_patternTexCoordTransform[1].w;
				//float3 fvTexX = tex2D( PatternSampler, flCoord ).rgb;
				float3 fvTexX = texture2D( patternMap, flCoord ).rgb;

				flCoord.x = dot( fvPos.xz, tempMatrix[0] ) + g_patternTexCoordTransform[0].w;
				flCoord.y = dot( fvPos.xz, tempMatrix[1] ) + g_patternTexCoordTransform[1].w;
				//float3 fvTexY = tex2D( PatternSampler, flCoord ).rgb;
				float3 fvTexY = texture2D( patternMap, flCoord ).rgb;

				flCoord.x = dot( fvPos.yx, tempMatrix[0] ) + g_patternTexCoordTransform[0].w;
				flCoord.y = dot( fvPos.yx, tempMatrix[1] ) + g_patternTexCoordTransform[1].w;
				//float3 fvTexZ = tex2D( PatternSampler, flCoord ).rgb;
				float3 fvTexZ = texture2D( patternMap, flCoord ).rgb;

			#else

				flCoord.x = dot( fvPos.yz, g_patternTexCoordTransform[0].xy ) + g_patternTexCoordTransform[0].w;
				flCoord.y = dot( fvPos.yz, g_patternTexCoordTransform[1].xy ) + g_patternTexCoordTransform[1].w;
				//float3 fvTexX = tex2D( PatternSampler, flCoord ).rgb;
				float3 fvTexX = texture2D( patternMap, flCoord ).rgb;

				flCoord.x = dot( fvPos.xz, g_patternTexCoordTransform[0].xy ) + g_patternTexCoordTransform[0].w;
				flCoord.y = dot( fvPos.xz, g_patternTexCoordTransform[1].xy ) + g_patternTexCoordTransform[1].w;
				//float3 fvTexY = tex2D( PatternSampler, flCoord ).rgb;
				float3 fvTexY = texture2D( patternMap, flCoord ).rgb;

				flCoord.x = dot( fvPos.yx, g_patternTexCoordTransform[0].xy ) + g_patternTexCoordTransform[0].w;
				flCoord.y = dot( fvPos.yx, g_patternTexCoordTransform[1].xy ) + g_patternTexCoordTransform[1].w;
				//float3 fvTexZ = tex2D( PatternSampler, flCoord ).rgb;
				float3 fvTexZ = texture2D( patternMap, flCoord ).rgb;

			#endif



			// smooth blend the three projections across the object-space surface normals
			float yBlend = abs( dot( fvNormal.xyz, float3( 0.0, 1.0, 0.0 ) ) );
			yBlend = pow( yBlend, g_flBlendYPow );

			float zBlend = abs( dot( fvNormal.xyz, float3( 0.0, 0.0, 1.0 ) ) );
			zBlend = pow( zBlend, g_flBlendZPow );

			float3 fvPatternMask = lerp( lerp( fvTexX, fvTexY, yBlend ), fvTexZ, zBlend );

			#if ( PAINT_STYLE == PAINT_STYLE_SPRAY )// paint wears off in layers
				fvPatternMask.xyz *= fvPaintEdges.xyz;
			#endif

			cPaint = lerp( lerp( lerp( g_cCamo0, g_cCamo1, fvPatternMask.r ), g_cCamo2, fvPatternMask.g ), g_cCamo3, fvPatternMask.b );
			#if ( PAINT_STYLE == PAINT_STYLE_ANODIZED_AIR )
				// apply any masking from the last two masks from MasksSampler, allowing some areas to be solid color
				cPaint = lerp( cPaint, g_cCamo2, fvMasks.g );
				cPaint = lerp( cPaint, g_cCamo3, fvMasks.b );
			#endif
		#endif

		// ------------------------------------------------------------------------------------------------------
		// Anodized style
		// ------------------------------------------------------------------------------------------------------
		#if ( PAINT_STYLE == PAINT_STYLE_ANODIZED )
			cPaint.rgb = g_cCamo0.rgb;
		#endif

		#if ( ( PAINT_STYLE == PAINT_STYLE_ANODIZED ) || ( PAINT_STYLE == PAINT_STYLE_ANODIZED_MULTI ) || ( PAINT_STYLE == PAINT_STYLE_ANODIZED_AIR ) )
			// chipped edges of anodized dye
			cPaint = lerp( cPaint, g_cAnodizedBase, flPaintEdges );
			cGrunge.rgb = lerp( cGrunge.rgb, float3( 1.0, 1.0, 1.0 ), flPaintEdges );

			// anodize only in areas specified by the masks texture
			flPaintBlend = saturate( 1.0 + flPaintBlend - fvMasks.r );
		#endif

		// ------------------------------------------------------------------------------------------------------
		// Custom painted style
		// ------------------------------------------------------------------------------------------------------
		#if ( PAINT_STYLE == PAINT_STYLE_CUSTOM )
			cPaint = fvPattern.rgb;
		#endif
		// ------------------------------------------------------------------------------------------------------
		// Antiqued or Gunsmith style
		// ------------------------------------------------------------------------------------------------------

		#if ( PAINT_STYLE == PAINT_STYLE_ANTIQUED )
			//float4 fvPattern = tex2D( PatternSampler, i.vBaseUV_PatternUV.zw );
		#endif

		#if ( ( PAINT_STYLE == PAINT_STYLE_ANTIQUED ) || ( PAINT_STYLE == PAINT_STYLE_GUNSMITH ) )
			float flPatinaBlend = flPaintWear * flAo * flCavity * flCavity;
			flPatinaBlend = smoothstep( 0.1, 0.2, flPatinaBlend * g_flWearAmt );

			float flOilRubBlend = saturate( flCavity * flAo - g_flWearAmt * 0.1 ) - flGrunge;
			flOilRubBlend = smoothstep( 0.0, 0.15, flOilRubBlend + 0.08 );

			float3 cPatina = lerp( g_cCamo1, g_cCamo2, g_flWearAmt );
			float3 cOilRubColor = lerp( g_cCamo1, g_cCamo3, pow( g_flWearAmt, 0.5 ) );
			cPatina = lerp( cOilRubColor, cPatina, flOilRubBlend ) * fvPattern.rgb;

			float3 vLumCoefficients = vec3(0.3, 0.59, 0.11);//TODO: set const
			float fPatternLum = dot( fvPattern.rgb, vLumCoefficients );

			float3 cScratches = g_cCamo0 * fPatternLum;

			cPatina = lerp( cPatina, cScratches, flPatinaBlend );

			#if ( PAINT_STYLE == PAINT_STYLE_ANTIQUED )
				cPaint = cPatina;
				flPaintBlend = 1.0 - fvMasks.r;
			#elif ( PAINT_STYLE == PAINT_STYLE_GUNSMITH )
				cPaint = lerp ( fvPattern.rgb, cPatina, fvMasks.r );
				flPaintBlend = flPaintBlend * ( 1.0 - fvMasks.r );
			#endif
		#endif

		// ------------------------------------------------------------------------------------------------------
		// All paints
		// ------------------------------------------------------------------------------------------------------

		float3 cModulation = fvAoSrc.bbb;//TODO: not sure was float3 cModulation = fvAoSrc.b;
		cPaint.rgb *= cGrunge.rgb;

		// On very dark paints, increase the modulation slightly by adding
		float3 lumCoefficients = vec3(0.3, 0.59, 0.11);//TODO: set const
		float flModulationLum = dot( cPaint.rgb, lumCoefficients );
		flModulationLum = 1.0 - smoothstep( 0.08, 0.15, flModulationLum );

		#if ( ( PAINT_STYLE == PAINT_STYLE_SOLID ) || ( PAINT_STYLE == PAINT_STYLE_HYDROGRAPHIC ) || ( PAINT_STYLE == PAINT_STYLE_SPRAY ) || ( PAINT_STYLE == PAINT_STYLE_CUSTOM ) )
			flModulationLum *= 0.03;
			cModulation = cModulation.rgb * ( cPaint.rgb + flModulationLum ) * 0.5;
		#elif ( PAINT_STYLE == PAINT_STYLE_GUNSMITH )
			flModulationLum *= lerp( 0.03, 0.005, fvMasks.r );
			cModulation = cModulation.rgb * ( cPaint.rgb + flModulationLum ) * lerp( 0.5, 2.0, fvMasks.r );
		#else
			flModulationLum *= 0.005;
			cModulation = cModulation.rgb * ( cPaint.rgb + flModulationLum ) * 2.0;
		#endif


		cPaint = saturate( cPaint + cModulation );

		cPaint.rgb *= flAo;

		cOut.rgb = lerp( cPaint, cBase.rgb, flPaintBlend );

		// ------------------------------------------------------------------------------------------------------
		// Specular Intensity Mask
		// ------------------------------------------------------------------------------------------------------
		#if ( PAINT_STYLE == PAINT_STYLE_GUNSMITH )
			#if ( PHONGALBEDOFACTORMODE == 1 )
				float flSpecMask = lerp( g_flPaintPhongIntensity, 1.0, fvMasks.r ) * flAo * cGrunge.a;
			#else
				float flSpecMask = lerp( g_flPaintPhongIntensity, g_flPhongAlbedoFactor, fvMasks.r ) * flAo * cGrunge.a;
			#endif
		#else
			float flSpecMask = g_flPaintPhongIntensity * flAo * cGrunge.a;
		#endif
		#if ( ( PAINT_STYLE == PAINT_STYLE_ANODIZED ) || ( PAINT_STYLE == PAINT_STYLE_ANODIZED_MULTI ) || ( PAINT_STYLE == PAINT_STYLE_ANODIZED_AIR ) || ( PAINT_STYLE == PAINT_STYLE_ANTIQUED ) || ( PAINT_STYLE == PAINT_STYLE_GUNSMITH ) )// anodized/metallic
			// phongalbedoboost must be increased in the material for the anodized look, so in areas that are
			// already using phongalbedo the specular intensity must be reduced in order to retain approximately
			// the same intensity as the originally authored texture
			float flInvPaintBlend = 1.0 - flPaintBlend;

			//float4 cOrigExp = tex2D( ExponentSampler, i.vBaseUV_PatternUV.xy );
			#if ( ( PREVIEW == 1 ) && ( PREVIEWPHONGALBEDOTINT == 0 ) )
				cOrigExp.g = 0.0;
			#endif
			#if ( PAINT_STYLE == PAINT_STYLE_ANTIQUED )
				flSpecMask *= lerp( flOilRubBlend * ( 1.0 - flPatinaBlend * g_flWearAmt ), 1.0, flPatinaBlend );
			#elif ( PAINT_STYLE == PAINT_STYLE_GUNSMITH )
				float flPaintSpecBlend = smoothstep( 0.9, 1.0, flPaintBlend ) * fvMasks.r;
				flSpecMask *= lerp(  smoothstep( 0.01, 0.0, flPaintBlend ), lerp( flOilRubBlend * ( 1.0 - flPatinaBlend * g_flWearAmt ), 1.0, flPatinaBlend ), fvMasks.r );
				flSpecMask = lerp( flSpecMask, cBase.a, flPaintSpecBlend );
				flPaintSpecBlend = smoothstep( 0.9, 1.0, flPaintBlend ) * ( 1.0 - fvMasks.r );
			#else
				flSpecMask *= lerp( g_flPaintPhongIntensity, g_flAnodizedBasePhongIntensity, flPaintEdges );
			#endif

			float flPhongAlbedoBlend = flPaintBlend;

			float flAdjustedBase = 1.0;
			#if ( PHONGALBEDOFACTORMODE == 1 )
				flAdjustedBase = lerp( 1.0, g_flPhongAlbedoFactor, cOrigExp.g * flPhongAlbedoBlend );
				cOut.a = lerp( flSpecMask, cBase.a * flAdjustedBase, flPaintBlend );
			#else
				cOut.a = lerp( flSpecMask * g_flPhongAlbedoFactor, cBase.a, flPhongAlbedoBlend );
			#endif

			#if ( PAINT_STYLE == PAINT_STYLE_GUNSMITH )
				cOut.a = lerp( flSpecMask, cBase.a * flAdjustedBase, flPaintSpecBlend );
			#endif

		#else // everything else
			float flPaintSpecBlend = smoothstep( 0.9, 1.0, flPaintBlend );
			flSpecMask *= smoothstep( 0.01, 0.0, flPaintBlend );
			cOut.a = lerp( flSpecMask, cBase.a, flPaintSpecBlend );
		#endif


	#endif

















	vec4 diffuseColor = vec4(1.0);
	//#include compute_fragment_color_map
	#ifndef USE_COLOR_MAP//TODO: probably not the best way to do that. We should remove all texelColor if no colorMap
		//vec4 texelColor = vec4(1.0);
	#endif
	#include compute_fragment_normal_map
	#include compute_fragment_phong_exponent_map

	#include compute_fragment_normal

	/*#ifdef USE_POS_MAP
		vec4 texelPos = texture2D(posMap, vTextureCoord.xy);
		texelPos.rgb *= texelPos.a * 16.0;//HDR decompression
	#else
		vec4 texelPos = vec4(0.0);
	#endif*/

	vec4 paintColor = texelPattern;

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

	//diffuseColor *= texelColor;
	#include compute_fragment_alpha_test

	vec3 albedo = vec3(1.0);//texelColor.rgb;
	#include source1_blend_tint
	#include compute_fragment_cube_map

	float alpha = g_DiffuseModulation.a;
	#include source1_colormap_alpha


	alpha = alpha;//lerp(alpha, alpha * vVertexColor.a, g_fVertexAlpha);



	float fogFactor = 0.0;

	if (length(mod(gl_FragCoord.xy, vec2(2.0))) < 1.0) {
	//	discard;
	}
	//gl_FragColor = vec4(albedo, alpha);
	//gl_FragColor.rgb = g_DiffuseModulation.rgb;
#ifndef IS_TRANSLUCENT
	gl_FragColor.a = 1.0;
#endif

#ifdef USE_SHEEN_MAP
	//gl_FragColor.rgb = texture2D(sheenMaskMap, vTextureCoord).rgb;
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

//gl_FragColor.rgb = vec3(phongMask);
/* TEST SHADING END*/




#ifdef USE_CUBE_MAP
	#if defined(USE_NORMAL_MAP) && defined(USE_NORMAL_ALPHA_AS_ENVMAP_MASK)
		gl_FragColor.rgb += cubeMapColor.rgb * uCubeMapTint.rgb * texelNormal.a;
	#else
		gl_FragColor.rgb += cubeMapColor.rgb * uCubeMapTint.rgb * texelColor.a;
	#endif
#endif

#if PAINT_STYLE == PAINT_STYLE_ANODIZED_AIR
	//gl_FragColor.rgb = vec3(1.0);
	/*patternColor = triplanarPatternColor(vPatternCoord2);
	float mask0 = max((1.0 - length(patternColor.rgb)) * texelMask1.r, 0.0);
	if (length(texelMask1.rgb) != texelMask1.r) {
		patternColor = vec4(0.0);
		mask0 = 0.0;
	}

	float mask1 = clamp(							patternColor.r, 0.0, 1.0);
	float mask2 = max(texelMask1.g, patternColor.g);
	float mask3 = max(texelMask1.b, patternColor.b);

	vec3 color0 = mask0 * uColor0;
	vec3 color1 = mask1 * uColor1;
	vec3 color2 = mask2 * uColor2;
	vec3 color3 = mask3 * uColor3;
	paintColor.rgb = vec3(color0 + color1 + color2 + color3) * 2.0;
	paintColor.a = texelMask1.r;
*/
#endif


	gl_FragColor.rgb = texelPattern.rgb;
	gl_FragColor.rgb = vec3(cOut);
	#include source1_compute_selfillum
	#include source1_compute_sheen
	#include compute_fragment_standard
	#include compute_fragment_render_mode

	//gl_FragColor.rgb = texture2D(scratchesMap, vTexture2Coord.xy).rgb;
	//gl_FragColor.rgb = texture2D(grungeMap, vTexture2Coord.zw).rgb;
	//gl_FragColor.rgb = texelAo.aaa;
}
`;
