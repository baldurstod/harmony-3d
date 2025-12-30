//TODO: set a vec3 for these three ?
struct PhongUniforms {
	phongExponent : f32,
	phongBoost : f32,
#ifdef USE_PHONG_EXPONENT_MAP
	phongExponentFactor : f32,
#endif
}

@group(0) @binding(x) var<uniform> phongUniforms : PhongUniforms;
