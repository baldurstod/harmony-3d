export default `
#include declare_lights
#include declare_shadow_mapping

uniform vec3 phongfresnelranges;

#include declare_fragment_color_map
#include declare_fragment_alpha_test

uniform sampler2D corneaMap;

/*const vec4 g_vIrisProjectionU = vec4(0, 1, 0, 0);
const vec4 g_vIrisProjectionV = vec4(0, 0, 1, 0);*/


uniform vec3 uEyeOrigin;
uniform vec4 uIrisProjectionU;
uniform vec4 uIrisProjectionV;
/********************************************/
varying vec4 vWorldPosition_ProjPosZ;
varying vec4 vTangentViewVector;

varying vec3 vWorldNormal;
varying vec3 vWorldTangent;
varying vec3 vWorldBinormal;

#define g_flEyeballRadius	5.51
//#define g_bRaytraceSphere	1.0
#define g_flParallaxStrength 0.25
/********************************************/

#include source1_varying_eyerefract
#include varying_standard

void main(void) {
	vec4 diffuseColor = vec4(1.0);
	//#include compute_fragment_color_map_mod1

	#ifdef USE_COLOR_MAP
		vec4 texelColor = texture2D(colorMap, mod(vTextureCoord.xy, 1.0));
	#endif
	diffuseColor *= texelColor;
	#include compute_fragment_alpha_test
		//texelColor.a = 1.0;
		gl_FragColor = texelColor;
#ifndef IS_TRANSLUCENT
	gl_FragColor.a = 1.0;
#endif
	//gl_FragColor = vec4(vTextureCoord/2.0, 0.0, 1.0);



/********************************************/
	vec3 vWorldPosition = vWorldPosition_ProjPosZ.xyz;
	vec2 vCorneaUv; // Note: Cornea texture is a cropped version of the iris texture
	vCorneaUv.x = dot( uIrisProjectionU, vec4( vWorldPosition, 1.0 ) );
	vCorneaUv.y = dot( uIrisProjectionV, vec4( vWorldPosition, 1.0 ) );
	vec2 vSphereUv = ( vCorneaUv.xy * 0.5 ) + 0.25;

	vec4 corneaColor = texture2D(corneaMap, mod(vCorneaUv, 1.0));
	float fIrisOffset = corneaColor.b;

	vec2 vParallaxVector = ( vTangentViewVector.xy * fIrisOffset * g_flParallaxStrength ) / ( 1.0 - vTangentViewVector.z ); // Note: 0.25 is a magic number
	vParallaxVector = ( vTangentViewVector.xy* g_flParallaxStrength) / ( 1.0 - vTangentViewVector.z );
	vParallaxVector.x = -vParallaxVector.x; //Need to flip x...not sure why.
	vParallaxVector = vec2(0.0);

	vec2 vIrisUv = vSphereUv.xy - vParallaxVector.xy;
	vec4 cIrisColor = texture2D(colorMap, vIrisUv);//tex2D( g_tIrisSampler, vIrisUv.xy );
	cIrisColor = pow(cIrisColor, vec4(1./2.2));
	cIrisColor.a = 1.0;
	gl_FragColor = cIrisColor;
	//gl_FragColor = vec4(abs(normalize(vCorneaUv.xy)),0.0 , 1.0);
	//gl_FragColor = vec4(abs(normalize(vParallaxVector.xy)), 0.0, 1.0);
	//gl_FragColor = vec4(abs(normalize(vWorldPosition.xyz)), 1.0);
	//gl_FragColor = vec4(abs(normalize(vTangentViewVector.xyz)), 1.0);
	//gl_FragColor = vec4(((1.0 - abs(vTangentViewVector).z)), 0.0, 0.0, 1.0);
	//gl_FragColor = vec4(abs(normalize(vIrisUv)), 0.0, 1.0);
	//gl_FragColor = texture2D(colorMap, mod(vTextureCoord, 1.0));gl_FragColor.a = 1.0;
	//gl_FragColor = vec4(abs(normalize(uEyeOrigin)), 1.0);
	//gl_FragColor = vec4(abs(normalize(uEyeOrigin)), 1.0);
	//gl_FragColor = vec4(length(vWorldPosition_ProjPosZ .xyz - uEyeOrigin) / 100.0, 0.0, 0.0, 1.0);
	//gl_FragColor = vec4(normalize(abs(vWorldPosition_ProjPosZ.xyz - uEyeOrigin)), 1.0);

	//gl_FragColor = vec4(abs(vWorldPosition_ProjPosZ.x) / 50.0, 0.0, 0.0, 1.0);
	//gl_FragColor = vec4(normalize(abs(vWorldNormal)), 1.0);
	//gl_FragColor = vec4(normalize(abs(vWorldTangent)), 1.0);
	//gl_FragColor = vec4(normalize(abs(vWorldBinormal)), 1.0);
/********************************************/
#include compute_fragment_render_mode
	#include compute_fragment_standard

#ifdef SKIP_PROJECTION
	gl_FragColor = texture2D(colorMap, mod(vTextureCoord.xy, 1.0));
	gl_FragColor.a = 1.;
#endif
}
`;
