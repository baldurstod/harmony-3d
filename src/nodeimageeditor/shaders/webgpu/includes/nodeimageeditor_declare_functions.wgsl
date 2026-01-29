#define SKIP_SRGB_ENC_DEC

fn invlerp( x: f32, y: f32, r: vec4f ) -> vec4f {
	return ( r - x ) / ( y - x );
}

fn convertLinearTosRGB( lin: vec4f ) -> vec4f {
	#ifdef SKIP_SRGB_ENC_DEC
		return lin;
	#else
		let col_lin: vec3f = lin.xyz;
		var col_srgb: vec3f;
		for (int i = 0; i < 3; ++i)
		{
			if ( col_lin[i] <= 0.0031308 )
				col_srgb[i] = 12.92 * col_lin[i];
			else
				col_srgb[i] = 1.055 * pow( col_lin[i], 1.0 / 2.4 ) - 0.055;
		}

		return vec4f( col_srgb.xyz, lin.a );
	#endif
}

fn convertsRGBToLinear( srgb: vec4f ) -> vec4f {
	#ifdef SKIP_SRGB_ENC_DEC
		return srgb;
	#else
		let col_lin: vec3f = srgb.xyz;
		var col_srgb: vec3f;

		for (int i = 0; i < 3; ++i)
		{
			if ( col_srgb[i] <= 0.04045 )
				col_lin[i] = col_srgb[i] / 12.92;
			else
				col_lin[i] = pow( ( col_srgb[i] + 0.055 ) / 1.055, 2.4 );
		}

		return vec4f( col_lin.xyz, srgb.a );
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
		inSrc = convertLinearTosRGB( inSrc );

		float pcg = saturate( invlerp( inBlackPoint, inWhitePoint, inSrc ) );
		float gammaAdjusted = pow( pcg, inGammaValue );

		gammaAdjusted = convertsRGBToLinear( gammaAdjusted );

		return saturate( gammaAdjusted );
	}
}*/

fn AdjustLevels( inSrc: vec4f, inBlackPoint: f32, inWhitePoint: f32, inGammaValue: f32 ) -> vec4f {
	if ( inBlackPoint == 0.0 && inWhitePoint == 1.0 && inGammaValue == 1.0 ) {
		return inSrc;
	} else {

		let pcg: vec4f = saturate( invlerp( inBlackPoint, inWhitePoint, convertLinearTosRGB( inSrc ) ) );
		var gammaAdjusted: vec4f = pow( pcg, vec4(inGammaValue) );

		gammaAdjusted = convertsRGBToLinear( gammaAdjusted );

		return saturate( gammaAdjusted );
	}
}
