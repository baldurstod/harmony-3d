#include luminance
#include declare_fragment_light_warp
#ifdef WRITE_DEPTH_TO_COLOR
	#ifdef IS_POINT_LIGHT
		uniform vec3 uLightPosition;
		uniform float uLightNear;
		uniform float uLightFar;
	#endif
#endif
#ifndef NUM_POINT_LIGHTS
	#define NUM_POINT_LIGHTS 0
#endif
#ifndef NUM_SPOT_LIGHTS
	#define NUM_SPOT_LIGHTS 0
#endif
#define NUM_HEMI_LIGHTS 0

//uniform vec3 lightProbe[ 9 ];
@group(1) @binding(7) var<uniform> lightProbe : array<vec4<f32>, 9>;
@group(1) @binding(8) var<uniform> ambientLight : vec4<f32>;

	struct GeometricContext {
		position: vec3<f32>,
		normal: vec3<f32>,
		worldNormal: vec3<f32>,
		viewDir: vec3<f32>,
	};

	struct PointLight {
		position: vec3<f32>,
		color: vec3<f32>,
		range: f32,
	};

	struct IncidentLight {//TODO: change structure name
		color: vec3<f32>,
		direction: vec3<f32>,
		visible: bool,
	};

	struct ReflectedLight {
		directDiffuse: vec3<f32>,
		directSpecular: vec3<f32>,
		indirectDiffuse: vec3<f32>,
		indirectSpecular: vec3<f32>,
	};

#if NUM_POINT_LIGHTS > 0
	uniform PointLight uPointLights[NUM_POINT_LIGHTS];
#endif

	float punctualLightIntensityToIrradianceFactor( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {

	#if defined ( PHYSICALLY_CORRECT_LIGHTS )

		// based upon Frostbite 3 Moving to Physically-based Rendering
		// page 32, equation 26: E[window1]
		// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
		// this is intended to be used on spot and point lights who are represented as luminous intensity
		// but who must be converted to luminous irradiance for surface lighting calculation
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );

		if( cutoffDistance > 0.0 ) {

			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );

		}

		return distanceFalloff;

	#else

		if( cutoffDistance > 0.0 && decayExponent > 0.0 ) {

			return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );

		}

		return 1.0;

	#endif

	}

vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {

	// normal is assumed to have unit length

	float x = normal.x, y = normal.y, z = normal.z;

	// band 0
	vec3 result = shCoefficients[ 0 ] * 0.886227;

	// band 1
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;

	// band 2
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );

	return result;

}

vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in GeometricContext geometry ) {

	vec3 irradiance = shGetIrradianceAt( geometry.worldNormal, lightProbe );

	return irradiance;

}

vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {

	vec3 irradiance = ambientLightColor;

	#ifndef PHYSICALLY_CORRECT_LIGHTS

		irradiance *= PI;

	#endif

	return irradiance;

}

	void computePointLightIrradiance(const PointLight pointLight, const GeometricContext geometry, out IncidentLight directLight) {
		vec3 lightVector = pointLight.position - geometry.position;
		directLight.direction = normalize(lightVector);
		float lightDistance = length(lightVector);
		directLight.color = pointLight.color;
		directLight.color *= punctualLightIntensityToIrradianceFactor( lightDistance, pointLight.range, 1.0/*pointLight.decay*/);


/*

		vec3 lVector = pointLight.position - geometry.position;
		directLight.direction = normalize( lVector );

		float lightDistance = length( lVector );

		directLight.color = pointLight.color;
		directLight.color *= punctualLightIntensityToIrradianceFactor( lightDistance, pointLight.distance, pointLight.decay );
		directLight.visible = ( directLight.color != vec3( 0.0 ) );
		*/


	}

#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float range;
		float innerAngleCos;
		float outerAngleCos;
	};
	uniform SpotLight uSpotLights[NUM_SPOT_LIGHTS];

	void computeSpotLightIrradiance(const SpotLight spotLight, const GeometricContext geometry, out IncidentLight directLight) {
		vec3 lightVector = spotLight.position - geometry.position;
		directLight.direction = normalize(lightVector);
		float lightDistance = length(lightVector);
		float angleCos = dot( directLight.direction, spotLight.direction );

		if (angleCos > spotLight.outerAngleCos ) {
			float spotEffect = smoothstep( spotLight.outerAngleCos, spotLight.innerAngleCos, angleCos );
			directLight.color = spotLight.color;
			directLight.color *= spotEffect;
			directLight.color *= punctualLightIntensityToIrradianceFactor( lightDistance, spotLight.range, 1.0/*spotLight.decay*/);
			directLight.visible = true;
		} else {
			directLight.color = vec3(0.0);
			directLight.visible = false;
		}

/*

		float angleCos = dot( directLight.direction, spotLight.direction );

		if ( angleCos > spotLight.coneCos ) {

			float spotEffect = smoothstep( spotLight.coneCos, spotLight.penumbraCos, angleCos );

			directLight.color = spotLight.color;
			directLight.color *= spotEffect * punctualLightIntensityToIrradianceFactor( lightDistance, spotLight.distance, spotLight.decay );
			directLight.visible = true;

		} else {

			directLight.color = vec3( 0.0 );
			directLight.visible = false;

		}
*/
	}
#endif

struct BlinnPhongMaterial {

	vec3	diffuseColor;
	vec3	specularColor;
	float	specularShininess;
	float	specularStrength;

};
vec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {

	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotLH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	float fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );

	return ( 1.0 - specularColor ) * fresnel + specularColor;

}

float G_BlinnPhong_Implicit( /* const in float dotNL, const in float dotNV */ ) {

	// geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)
	return 0.25;

}

float D_BlinnPhong( const in float shininess, const in float dotNH ) {

	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH + EPSILON, shininess );

}
vec3 BRDF_Diffuse_Lambert( const in vec3 diffuseColor ) {

	return RECIPROCAL_PI * diffuseColor;

}vec3 BRDF_Specular_BlinnPhong( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float shininess ) {

	vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );

	//float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );
	//float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
	float dotNH = saturate( dot( geometry.normal, halfDir ) );
	float dotLH = saturate( dot( incidentLight.direction, halfDir ) );

	vec3 F = F_Schlick( specularColor, dotLH );

	float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );

	float D = D_BlinnPhong( shininess, dotNH );

	return F * ( G * D );

}
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {

	#ifdef TOON

		vec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;

	#else

		float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
		vec3 irradiance = dotNL * directLight.color;

	#endif

	#ifndef PHYSICALLY_CORRECT_LIGHTS

		irradiance *= PI; // punctual light

	#endif

	reflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );

	reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess ) * material.specularStrength;

}

void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );

}




#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong
