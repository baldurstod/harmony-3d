export default `

const vec3 Fdielectric = vec3(0.04);

#ifndef NUM_PBR_LIGHTS
	#define NUM_PBR_LIGHTS 0
#endif

struct PBRLight {
	vec3 position;
	vec3 radiance;
};

#if NUM_PBR_LIGHTS > 0
	uniform PBRLight uPbrLights[NUM_PBR_LIGHTS];
#endif

// GGX/Towbridge-Reitz normal distribution function.
// Uses Disney's reparametrization of alpha = roughness^2.
float ndfGGX(float cosLh, float roughness)
{
	float alpha   = roughness * roughness;
	float alphaSq = alpha * alpha;

	float denom = (cosLh * cosLh) * (alphaSq - 1.0) + 1.0;
	return alphaSq / (PI * denom * denom);
}

// Single term for separable Schlick-GGX below.
float gaSchlickG1(float cosTheta, float k)
{
	return cosTheta / (cosTheta * (1.0 - k) + k);
}

// Schlick-GGX approximation of geometric attenuation function using Smith's method.
float gaSchlickGGX(float cosLi, float cosLo, float roughness)
{
	float r = roughness + 1.0;
	float k = (r * r) / 8.0; // Epic suggests using this roughness remapping for analytic lights.
	return gaSchlickG1(cosLi, k) * gaSchlickG1(cosLo, k);
}

// Shlick's approximation of the Fresnel factor.
vec3 fresnelSchlick(vec3 F0, float cosTheta)
{
	return F0 + (vec3(1.0) - F0) * pow(1.0 - cosTheta, 5.0);
}

vec3 computeLightPBR(PBRLight light, vec3 normal, vec3 fragmentPositionWorldSpace, vec3 Lo, float cosLo, vec3 F0, float metalness, float roughness, vec3 albedo) {
		vec3 Li = light.position - fragmentPositionWorldSpace;
		float d = length(Li);
		Li = normalize(Li);
		vec3 Lradiance = light.radiance / (d * d);

		// Half-vector between Li and Lo.
		vec3 Lh = normalize(Li + Lo);

		// Calculate angles between surface normal and various light vectors.
		float cosLi = max(0.0, dot(normal, Li));
		float cosLh = max(0.0, dot(normal, Lh));

		// Calculate Fresnel term for direct lighting.
		vec3 F  = fresnelSchlick(F0, max(0.0, dot(Lh, Lo)));
		// Calculate normal distribution for specular BRDF.
		float D = ndfGGX(cosLh, roughness);
		// Calculate geometric attenuation for specular BRDF.
		float G = gaSchlickGGX(cosLi, cosLo, roughness);

		// Diffuse scattering happens due to light being refracted multiple times by a dielectric medium.
		// Metals on the other hand either reflect or absorb energy, so diffuse contribution is always zero.
		// To be energy conserving we must scale diffuse BRDF contribution based on Fresnel factor & metalness.
		vec3 kd = mix(vec3(1.0) - F, vec3(0.0), metalness);

		// Lambert diffuse BRDF.
		// We don't scale by 1/PI for lighting & material units to be more convenient.
		// See: https://seblagarde.wordpress.com/2012/01/08/pi-or-not-to-pi-in-game-lighting-equation/
		vec3 diffuseBRDF = kd * albedo;

		// Cook-Torrance specular microfacet BRDF.
		vec3 specularBRDF = (F * D * G) / max(EPSILON, 4.0 * cosLi * cosLo);

		// Total contribution for this light.
		return (diffuseBRDF + specularBRDF) * Lradiance * cosLi;
}

#if NUM_PBR_LIGHTS > 0
	vec3 computePBR(PBRLight light[NUM_PBR_LIGHTS], vec3 normal, vec3 cameraPosition, vec3 fragmentPositionWorldSpace, vec3 F0, float metalness, float roughness, vec3 albedo, float ao) {
		vec3 Lo = normalize(cameraPosition - fragmentPositionWorldSpace);//vec3 Lo = normalize(eyePosition - vin.position);
		float cosLo = max(0.0, dot(normal, Lo));

		vec3 directLighting = vec3(0);
		for(int i=0; i<NUM_PBR_LIGHTS; ++i) {
			directLighting += computeLightPBR(light[i], normal, fragmentPositionWorldSpace, Lo, cosLo, F0, metalness, roughness, albedo);
		}

		vec3 ambientLighting = uAmbientLight * albedo * ao;
		return directLighting + ambientLighting;
	}
#endif

`;
