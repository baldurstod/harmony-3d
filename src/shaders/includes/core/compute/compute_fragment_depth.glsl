export default `
#ifdef ALWAYS_ON_TOP
	gl_FragDepth =  gl_FragCoord.z / 100.0;
#endif
#ifdef ALWAYS_BEHIND
	gl_FragDepth =  1.0 - EPSILON;
#endif
`;
