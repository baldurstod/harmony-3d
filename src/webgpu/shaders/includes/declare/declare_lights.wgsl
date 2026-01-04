#include math_defines
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
@group(0) @binding(x) var<uniform> lightProbe: array<vec3f, 9>;
@group(0) @binding(x) var<uniform> ambientLight: vec3f;

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
	//uniform PointLight uPointLights[NUM_POINT_LIGHTS];
	@group(0) @binding(x) var<uniform> pointLights: array<PointLight, NUM_POINT_LIGHTS>;
#endif

	fn punctualLightIntensityToIrradianceFactor(lightDistance: f32, cutoffDistance: f32, decayExponent: f32 ) -> f32 {

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

fn shGetIrradianceAt( normal: vec3f, shCoefficients: array<vec3f, 9> ) -> vec3f {

	// normal is assumed to have unit length

	let x: f32 = normal.x;
	let y: f32 = normal.y;
	let z: f32 = normal.z;

	// band 0
	var result: vec3f = shCoefficients[ 0 ] * 0.886227;

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

fn getLightProbeIrradiance( lightProbe: array<vec3f, 9>, geometry: GeometricContext ) -> vec3f{

	return shGetIrradianceAt( geometry.worldNormal, lightProbe );

}

fn getAmbientLightIrradiance( ambientLightColor: vec3f ) -> vec3f{

	var irradiance: vec3f = ambientLightColor;

	#ifndef PHYSICALLY_CORRECT_LIGHTS

		irradiance *= PI;

	#endif

	return irradiance;

}

	fn computePointLightIrradiance( pointLight: PointLight, geometry: GeometricContext, directLight: ptr<function, IncidentLight>) {
		let lightVector: vec3f = pointLight.position - geometry.position;
		directLight.direction = normalize(lightVector);
		let lightDistance: f32 = length(lightVector);
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
		position: vec3f,
		direction: vec3f,
		color: vec3f,
		range: f32,
		innerAngleCos: f32,
		outerAngleCos: f32,
	};
	@group(0) @binding(x) var<uniform> spotLights: array<SpotLight, NUM_SPOT_LIGHTS>;

	fn computeSpotLightIrradiance(spotLight: SpotLight, geometry: GeometricContext, directLight: ptr<function, IncidentLight>) {
		let lightVector: vec3f = spotLight.position - geometry.position;
		directLight.direction = normalize(lightVector);
		let lightDistance: f32 = length(lightVector);
		let angleCos: f32 = dot( directLight.direction, spotLight.direction );

		if (angleCos > spotLight.outerAngleCos ) {
			let spotEffect: f32 = smoothstep( spotLight.outerAngleCos, spotLight.innerAngleCos, angleCos );
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

	diffuseColor: vec3f,
	specularColor: vec3f,
	specularShininess: f32,
	specularStrength: f32,

};
fn F_Schlick( specularColor: vec3f, dotLH: f32 ) -> vec3f {

	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotLH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	let fresnel: f32 = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );

	return ( 1.0 - specularColor ) * fresnel + specularColor;

}

fn G_BlinnPhong_Implicit( /* const in float dotNL, const in float dotNV */ ) -> f32 {

	// geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)
	return 0.25;

}

fn D_BlinnPhong( shininess: f32, dotNH: f32 ) -> f32 {

	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH + EPSILON, shininess );

}
fn BRDF_Diffuse_Lambert( diffuseColor: vec3f ) -> vec3f {

	return RECIPROCAL_PI * diffuseColor;

}
fn BRDF_Specular_BlinnPhong( incidentLight: IncidentLight, geometry: GeometricContext, specularColor: vec3f , shininess: f32 ) -> vec3f {

	let halfDir: vec3f = normalize( incidentLight.direction + geometry.viewDir );

	//float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );
	//float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
	let dotNH: f32 = saturate( dot( geometry.normal, halfDir ) );
	let dotLH: f32 = saturate( dot( incidentLight.direction, halfDir ) );

	let F: vec3f = F_Schlick( specularColor, dotLH );

	let G: f32 = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );

	let D: f32 = D_BlinnPhong( shininess, dotNH );

	return F * ( G * D );

}
fn RE_Direct_BlinnPhong( directLight: IncidentLight, geometry: GeometricContext, material: BlinnPhongMaterial, reflectedLight: ptr<function, ReflectedLight> ) {

	#ifdef TOON

		var irradiance: vec3f = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;

	#else

		let dotNL: f32 = saturate( dot( geometry.normal, directLight.direction ) );
		var irradiance: vec3f = dotNL * directLight.color;

	#endif

	#ifndef PHYSICALLY_CORRECT_LIGHTS

		irradiance *= PI; // punctual light

	#endif

	reflectedLight.directDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );

	reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong( directLight, geometry, material.specularColor, material.specularShininess ) * material.specularStrength;

}

fn RE_IndirectDiffuse_BlinnPhong( irradiance: vec3f, geometry: GeometricContext, material: BlinnPhongMaterial, reflectedLight: ptr<function, ReflectedLight> ) {

	reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor );

}




#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong
