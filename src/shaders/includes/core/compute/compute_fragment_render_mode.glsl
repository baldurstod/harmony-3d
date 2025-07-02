export default `
#ifdef RENDER_MODE
	#if RENDER_MODE == 1
		#ifdef TESTING
			gl_FragColor = vec4(abs(vVertexNormalModelSpace.xyz), 1.0);
		#endif
	#elif RENDER_MODE == 2
		gl_FragColor = vec4(abs(vVertexNormalWorldSpace), 1.0);
	#elif RENDER_MODE == 3
		gl_FragColor = vec4(abs(vVertexNormalCameraSpace), 1.0);
	#elif RENDER_MODE == 4
		#ifdef TESTING
			gl_FragColor = vec4(abs(vVertexTangentModelSpace.xyz), 1.0);
		#endif
	#elif RENDER_MODE == 5
		#ifdef TESTING
			gl_FragColor = vec4(abs(vVertexTangentWorldSpace), 1.0);
		#endif
	#elif RENDER_MODE == 6
		gl_FragColor = vec4(abs(vVertexTangentCameraSpace), 1.0);
	#elif RENDER_MODE == 7
		#ifdef TESTING
			gl_FragColor = vec4(abs(vVertexBitangentWorldSpace), 1.0);
		#endif
	#elif RENDER_MODE == 8
		gl_FragColor = vec4(abs(vVertexBitangentCameraSpace), 1.0);
	#elif RENDER_MODE == 10
		gl_FragColor = vec4(tangentSpaceNormal, 1.0);
	#elif RENDER_MODE == 11
		gl_FragColor = vec4(abs(fragmentNormalCameraSpace), 1.0);
	#elif RENDER_MODE == 12
		#ifdef USE_NORMAL_MAP
			gl_FragColor = vec4(texelNormal.rgb, 1.0);
		#else
			gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0);
		#endif
	#endif
#endif
`;
