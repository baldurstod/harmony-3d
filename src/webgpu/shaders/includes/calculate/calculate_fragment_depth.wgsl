#ifdef ALWAYS_ON_TOP
	fragDepth = fragInput.position.z / 100.0;
#elifdef ALWAYS_BEHIND
	fragDepth = 1.0 - EPSILON;
#else
	fragDepth = fragInput.position.z;
#endif
