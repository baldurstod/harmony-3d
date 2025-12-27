export default `
#ifndef SKIP_LIGHT_WARP
	#ifdef USE_LIGHT_WARP_MAP
		uniform sampler2D lightWarpTexture;

		vec3 getLightWarp(const in float value) {
			return texture2D(lightWarpTexture, vec2(value, 0.5) ).rgb;
		}
	#endif
#endif
`;
