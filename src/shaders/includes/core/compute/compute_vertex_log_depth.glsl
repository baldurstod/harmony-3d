export default `
#ifdef USE_LOG_DEPTH
	vFragDepth = 1.0 + gl_Position.w;
#endif
`;
