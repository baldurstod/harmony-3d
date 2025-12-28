#ifndef SKIP_LIGHT_WARP
	#ifdef USE_LIGHT_WARP_MAP
		@group(1) @binding(x) var lightWarpTexture: texture_2d<f32>;
		@group(1) @binding(x) var lightWarpSampler: sampler;

		fn getLightWarp(value: f32) -> vec3f {
			return textureSample(lightWarpTexture, lightWarpSampler, vec2(value, 0.5)).rgb;
		}
	#endif
#endif
