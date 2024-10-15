export default `
#ifndef SKIP_GAMMA_TO_LINEAR
	float GammaToLinear(const float gamma) {
		return pow(gamma, 2.2);
	}
	vec3 GammaToLinear(const vec3 gamma) {
		return pow(gamma, vec3(2.2));
	}
	vec4 GammaToLinear(const vec4 gamma) {
		return vec4(pow(gamma.rgb, vec3(2.2)), gamma.a);
	}
#else
	float GammaToLinear(const float gamma) {
		return gamma;
	}
	vec3 GammaToLinear(const vec3 gamma) {
		return gamma;
	}
	vec4 GammaToLinear(const vec4 gamma) {
		return gamma;
	}
#endif
`;
