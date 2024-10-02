export default `
#ifdef HIGH_PRECISION
	#ifdef GL_FRAGMENT_PRECISION_HIGH
		precision highp float;
		precision highp int;
	#else
		precision mediump float;
		precision mediump int;
	#endif
#endif

#ifdef MEDIUM_PRECISION
	precision mediump float;
	precision mediump int;
#endif

#ifdef LOW_PRECISION
	precision lowp float;
	precision lowp int;
#endif
`;
