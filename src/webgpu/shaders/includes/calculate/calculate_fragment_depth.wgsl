#ifdef ALWAYS_ON_TOP
	fragDepth =  fragInput.position.w / 100.0;
#endif
#ifdef ALWAYS_BEHIND
	fragDepth =  1.0 - EPSILON;
#endif
