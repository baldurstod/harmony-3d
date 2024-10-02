export default `
#ifdef USE_MESH_COLOR
	vec4 diffuseColor = uColor;
#else
	#ifdef USE_VERTEX_COLOR
		vec4 diffuseColor = vVertexColor;
	#else
		vec4 diffuseColor = vec4(1.0);
	#endif
#endif
`;
