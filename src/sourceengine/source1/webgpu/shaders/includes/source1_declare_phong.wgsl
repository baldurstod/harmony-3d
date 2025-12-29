//TODO: set a vec3 for these three ?
@group(0) @binding(x) var<uniform> uPhongExponent: f32;
@group(0) @binding(x) var<uniform> uPhongBoost: f32;
#ifdef USE_PHONG_EXPONENT_MAP
	@group(0) @binding(x) var<uniform> uPhongExponentFactor: f32;
#endif
