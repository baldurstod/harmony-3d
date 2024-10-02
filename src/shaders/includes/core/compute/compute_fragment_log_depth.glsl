export default `
#ifdef USE_LOG_DEPTH
	#ifdef IS_PERSPECTIVE_CAMERA
		gl_FragDepthEXT = log2(vFragDepth) * uProjectionLogDepth * 0.5;
	#endif
	#ifdef IS_ORTHOGRAPHIC_CAMERA
		gl_FragDepthEXT = gl_FragCoord.z;
	#endif
#endif
`;
