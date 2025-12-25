#ifdef USE_MESH_COLOR
	var<function> diffuseColor: vec4<f32> = meshColor;
#else
	#ifdef USE_VERTEX_COLOR
		var<function> diffuseColor: vec4<f32> = fragInput.vVertexColor;
	#else
		var<function> diffuseColor: vec4<f32> = vec4(1.0);
	#endif
#endif
