#if defined(ALWAYS_ON_TOP) || defined(ALWAYS_BEHIND)
	#define SET_FRAG_DEPTH
#endif

struct FragmentOutput {
	@location(0) color: vec4<f32>,
#ifdef SET_FRAG_DEPTH
	@builtin(frag_depth) depth: f32,
#endif
};
