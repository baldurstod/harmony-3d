let vertexPositionModelSpace: vec4f = vec4(position, 1.0);
#ifndef HAS_NORMALS
	let normal: vec3f = vec3(1., 0., 0.);
#endif
#ifdef REVERSE_CULLING
	let vertexNormalModelSpace: vec4f = vec4(-normal, 0.0);
#else
	let vertexNormalModelSpace: vec4f = vec4(normal, 0.0);
#endif

#ifdef USE_VERTEX_TANGENT
	let vertexTangentModelSpace: vec4f = vec4(tangent.xyz, 0.0);
#else
	//TODO: compute it properly
	let vertexTangentModelSpace: vec4f = vec4(0.0, 1.0, 0.0, 0.0);
#endif

output.vVertexNormalModelSpace = vertexNormalModelSpace;
//output.vVertexTangentModelSpace = vertexTangentModelSpace;
