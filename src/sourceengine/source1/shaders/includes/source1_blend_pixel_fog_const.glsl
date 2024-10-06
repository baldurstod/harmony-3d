export default `
vec3 BlendPixelFogConst( const vec3 vShaderColor, float pixelFogFactor, const vec3 vFogColor, float fPixelFogType )
{
	pixelFogFactor = clamp( pixelFogFactor, 0.0, 1.0);
	vec3 fRangeResult = mix( vShaderColor.rgb, vFogColor.rgb, pixelFogFactor * pixelFogFactor ); //squaring the factor will get the middle range mixing closer to hardware fog
	vec3 fHeightResult = mix( vShaderColor.rgb, vFogColor.rgb, pixelFogFactor);
	return mix( fRangeResult, fHeightResult, fPixelFogType );
}
`;
