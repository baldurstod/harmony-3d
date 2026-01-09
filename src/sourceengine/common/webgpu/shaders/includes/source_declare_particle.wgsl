#pragma once

#include mat4_from_quat
#include rotation_matrix

#ifdef HARDWARE_PARTICLES
	struct Particle {
		center: vec3f,
		color: vec4f,
		radius: f32,
		roll: f32,
		yaw: f32,
		vecDelta: vec4f,
		normal: vec3f,
	};
	//uniform sampler2D uParticles;

	@group(0) @binding(x) var<storage, read> particles: array<array<vec4f, 8>, MAX_PARTICLES_IN_A_SYSTEM>;
	@group(0) @binding(x) var<uniform> uMaxParticles: f32;
	@group(0) @binding(x) var<uniform> uVisibilityCameraDepthBias: f32;
	@group(0) @binding(x) var<uniform> uOrientationControlPoint: vec4f;

	#include source1_declare_particle_position
	#include vec3_transform_quat

	fn getParticle(particleId: u32) -> Particle {
		var particle: Particle;

		particle.center = particles[particleId][0].xyz;
		particle.color = particles[particleId][1];
		let rrya: vec4f = particles[particleId][2];
		particle.vecDelta = particles[particleId][3];
		particle.normal = particles[particleId][4].xyz;
		let renderScreenVelocityRotate: vec4f = particles[particleId][5];

		particle.color.a = clamp(particle.color.a, 0., 1.);
		particle.radius = rrya.r;

		if (renderScreenVelocityRotate.x == 0.0) {
			particle.roll = rrya.b;
		} else {
			particle.roll = atan2(particle.vecDelta.y, particle.vecDelta.x) + renderScreenVelocityRotate.z - 1.57;
		}

		particle.yaw = rrya.a;
		return particle;
	}
#endif
