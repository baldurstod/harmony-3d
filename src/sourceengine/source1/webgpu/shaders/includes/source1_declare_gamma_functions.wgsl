#ifndef SKIP_GAMMA_TO_LINEAR
	fn GammaToLinearFloat(gamma: f32) -> f32 {
		return pow(gamma, 2.2);
	}
	fn GammaToLinearVec3(gamma: vec3f) -> vec3f {
		return pow(gamma, vec3f(2.2));
	}
	fn GammaToLinearVec4(gamma: vec4f) -> vec4f {
		return vec4(pow(gamma.rgb, vec3f(2.2)), gamma.a);
	}
#else
	fn GammaToLinearFloat(gamma: f32) -> f32 {
		return gamma;
	}
	fn GammaToLinearVec3(gamma: vec3f) -> vec3f {
		return gamma;
	}
	fn GammaToLinearVec4(const vec4 gamma) -> vec4f {
		return gamma;
	}
#endif
