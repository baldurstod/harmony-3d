export default `
#pragma once

#include mat4_from_quat
#include rotation_matrix

#ifdef HARDWARE_PARTICLES
	uniform sampler2D uParticles;
	uniform float uMaxParticles;
	uniform float uVisibilityCameraDepthBias;//TODO: pack some uniforms
	uniform vec4 uOrientationControlPoint;

	#include source1_declare_particle_position
	#include vec3_transform_quat

	struct particle {
		vec3 center;
		vec4 color;
		float radius;
		float roll;
		float yaw;
		vec4 vecDelta;
		vec3 normal;
	};

	particle getParticle(int particleId) {
		particle result;
		vec4 renderScreenVelocityRotate;
		#ifdef WEBGL2
			result.center = texelFetch(uParticles, ivec2(0, particleId), 0).rgb;
			result.color = texelFetch(uParticles, ivec2(1, particleId), 0);
			vec4 rrya = texelFetch(uParticles, ivec2(2, particleId), 0);
			result.vecDelta = texelFetch(uParticles, ivec2(3, particleId), 0);
			result.normal = texelFetch(uParticles, ivec2(4, particleId), 0).rgb;
			renderScreenVelocityRotate = texelFetch(uParticles, ivec2(5, particleId), 0);
		#else
			float texelPos = float(particleId) / uMaxParticles;
			result.center = texture2D(uParticles, vec2(0.00, texelPos)).rgb;
			result.color = texture2D(uParticles, vec2(0.125, texelPos));
			vec4 rrya = texture2D(uParticles, vec2(0.25, texelPos));
			result.vecDelta = texture2D(uParticles, vec2(0.375, texelPos));
			result.normal = texture2D(uParticles, vec2(0.5, texelPos)).rgb;
			renderScreenVelocityRotate = texture2D(uParticles, vec2(0.625, texelPos));
		#endif

		result.color.a = clamp(result.color.a, 0., 1.);
		result.radius = rrya.r;

		if (renderScreenVelocityRotate.x == 0.0) {
			result.roll = rrya.b;
		} else {
			result.roll = atan(result.vecDelta.y, result.vecDelta.x) + renderScreenVelocityRotate.z - 1.57;
		}

		result.yaw = rrya.a;
		return result;
	}
#endif
`;
