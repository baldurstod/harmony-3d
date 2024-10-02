export default `
#include precision
#include common_defines
#include common_uniforms
#include depth_packing

#ifdef WEBGL2
	#define attribute in
	#define varying out
#endif
`;
