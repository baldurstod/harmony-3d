export default `
#include compute_fragment_mask_map
#include compute_fragment_mask1_map
#include compute_fragment_mask2_map
#ifndef USE_MASK_MAP
	vec4 texelMask = vec4(1.0);
#endif
#ifndef USE_MASK1_MAP
	vec4 texelMask1 = vec4(1.0);
#endif
#ifndef USE_MASK2_MAP
	vec4 texelMask2 = vec4(1.0);
#endif
`;
