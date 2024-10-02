export default `
#ifdef WEBGL1
	#extension GL_EXT_frag_depth : enable
#endif
#include precision
#include common_defines
#include common_functions
#include common_uniforms
#include depth_packing

#ifdef WEBGL2
	#define varying in

	out vec4 fragColor;
	#define gl_FragColor fragColor
#endif

#ifdef WEBGL1
	#define gl_FragDepth gl_FragDepthEXT
#endif
#ifdef WEBGL2
	#define gl_FragDepthEXT gl_FragDepth
#endif
`;
