export default `

const vec4 g_LinearFogColor = vec4(0.0, 0.0, 0.0, 1.0 / 192.0);
#define OO_DESTALPHA_DEPTH_RANGE (g_LinearFogColor.w)

#define HDR_INPUT_MAP_SCALE 16.0

#define TONEMAP_SCALE_NONE 0
#define TONEMAP_SCALE_LINEAR 1
#define TONEMAP_SCALE_GAMMA 2


#define LINEAR_LIGHT_SCALE 1.0
#define LIGHT_MAP_SCALE 1.0
#define ENV_MAP_SCALE 1.0
#define GAMMA_LIGHT_SCALE pow(1.0, 1.0 / 2.2);

//sampler1D GammaTableSampler : register( s15 );
uniform sampler2D gammaTableMap;

vec3 SRGBOutput( const vec3 vShaderColor )
{
	return vShaderColor;//TODOv3: remove me
	//On ps2b capable hardware we always have the linear->gamma conversion table texture in sampler s15.
	vec3 result;
	result.r = texture2D( gammaTableMap, vec2(vShaderColor.r, 0.5)).r;
	result.g = texture2D( gammaTableMap, vec2(vShaderColor.g, 0.5)).r;
	result.b = texture2D( gammaTableMap, vec2(vShaderColor.b, 0.5)).r;
	return result;
}

float SoftParticleDepth( float flDepth )
{
	return flDepth * OO_DESTALPHA_DEPTH_RANGE;
}
float DepthToDestAlpha( const float flProjZ )
{
	return SoftParticleDepth( flProjZ );
}


float3 CalcReflectionVectorUnnormalized( float3 normal, float3 eyeVector )
{
	// FIXME: might be better of normalizing with a normalizing cube map and
	// get rid of the dot( normal, normal )
	// compute reflection vector r = 2 * ((n dot v)/(n dot n)) n - v
	//  multiply all values through by N.N.  uniformly scaling reflection vector won't affect result
	//  since it is used in a cubemap lookup
	return (2.0*(dot( normal, eyeVector ))*normal) - (dot( normal, normal )*eyeVector);
}


// Traditional fresnel term approximation
float Fresnel( const float3 vNormal, const float3 vEyeDir )
{
	float fresnel = 1.0-saturate( dot( vNormal, vEyeDir ) );				// 1-(N.V) for Fresnel term
	return fresnel * fresnel;											// Square for a more subtle look
}

// Traditional fresnel term approximation which uses 4th power (square twice)
float Fresnel4( const float3 vNormal, const float3 vEyeDir )
{
	float fresnel = 1.0-saturate( dot( vNormal, vEyeDir ) );				// 1-(N.V) for Fresnel term
	fresnel = fresnel * fresnel;										// Square
	return fresnel * fresnel;											// Square again for a more subtle look
}

float Fresnel( const float3 vNormal, const float3 vEyeDir, float3 vRanges )
{
	float result, f = Fresnel( vNormal, vEyeDir );			// Traditional Fresnel

	if ( f > 0.5 )
		result = lerp( vRanges.y, vRanges.z, (2.0*f)-1.0 );		// Blend between mid and high values
	else
		result = lerp( vRanges.x, vRanges.y, 2.0*f );			// Blend between low and mid values
	return result;
}
`;
