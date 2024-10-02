export default `
// conversion from glsl es1 to es3
#ifdef WEBGL2
	#define texture2D texture
	#define textureCube texture
#endif

// conversion from HLSL to glsl
#define float4 vec4
#define float3 vec3
#define float2 vec2
#define lerp mix
#define saturate(x) clamp(x, 0.0, 1.0)
#define tex2D texture2D
#define texCUBE textureCube
#define fmod(x, y) x - y * trunc(x/y)

// Math
#define PI 3.141592653589793
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_TAU 0.15915494309189535
#define HALF_PI 1.5707963267948966
#define TWO_PI 6.283185307179586
#define TAU TWO_PI
#define EPSILON 0.000001

highp float rand(vec2 co) {
	const highp float a = 12.9898;
	const highp float b = 78.233;
	const highp float c = 43758.5453;
	highp float dt= dot(co.xy ,vec2(a,b));
	highp float sn= mod(dt,3.14);
	return fract(sin(sn) * c);
}
`;
