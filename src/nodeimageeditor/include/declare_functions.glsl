export default `
#define SKIP_SRGB_ENC_DEC

float4 invlerp( float x, float y, float4 r )
{
	return ( r - x ) / ( y - x );
}


float4 ConvertLinearTosRGB( float4 lin )
{
	#ifdef SKIP_SRGB_ENC_DEC
		return lin;
	#else
		float3 col_lin = lin.xyz;
		float3 col_srgb;
		for (int i = 0; i < 3; ++i)
		{
			if ( col_lin[i] <= 0.0031308 )
				col_srgb[i] = 12.92 * col_lin[i];
			else
				col_srgb[i] = 1.055 * pow( col_lin[i], 1.0 / 2.4 ) - 0.055;
		}

		return float4( col_srgb.xyz, lin.a );
	#endif
}

float4 ConvertsRGBToLinear( float4 srgb )
{
	#ifdef SKIP_SRGB_ENC_DEC
		return srgb;
	#else
		float3 col_srgb = srgb.xyz;
		float3 col_lin;

		for (int i = 0; i < 3; ++i)
		{
			if ( col_srgb[i] <= 0.04045 )
				col_lin[i] = col_srgb[i] / 12.92;
			else
				col_lin[i] = pow( ( col_srgb[i] + 0.055 ) / 1.055, 2.4 );
		}

		return float4( col_lin.xyz, srgb.a );
	#endif
}

// Uses photoshop math to perform level adjustment.
// Note: Photoshop does this math in sRGB space, even though that is mathematically wrong.
// To match photoshop, we have to convert our textures from linear space (they're always linear in the shader)
// to sRGB, perform the calculations and then return to linear space for output from the shader.
// Yuck.
/*float AdjustLevels( float inSrc, float inBlackPoint, float inWhitePoint, float inGammaValue )
{
	if ( inBlackPoint == 0.0 && inWhitePoint == 1.0 && inGammaValue == 1.0 )
		return inSrc;
	else
	{
		inSrc = ConvertLinearTosRGB( inSrc );

		float pcg = saturate( invlerp( inBlackPoint, inWhitePoint, inSrc ) );
		float gammaAdjusted = pow( pcg, inGammaValue );

		gammaAdjusted = ConvertsRGBToLinear( gammaAdjusted );

		return saturate( gammaAdjusted );
	}
}*/

float4 AdjustLevels( float4 inSrc, float inBlackPoint, float inWhitePoint, float inGammaValue )
{
	if ( inBlackPoint == 0.0 && inWhitePoint == 1.0 && inGammaValue == 1.0 )
		return inSrc;
	else
	{
		inSrc = ConvertLinearTosRGB( inSrc );

		float4 pcg = saturate( invlerp( inBlackPoint, inWhitePoint, inSrc ) );
		float4 gammaAdjusted = pow( pcg, vec4(inGammaValue) );

		gammaAdjusted = ConvertsRGBToLinear( gammaAdjusted );

		return saturate( gammaAdjusted );
	}
}

`;
