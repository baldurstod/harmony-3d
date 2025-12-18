#ifdef SET_FRAG_DEPTH
	return FragmentOutput(fragColor, fragDepth);
#else
	return FragmentOutput(fragColor);
#endif
