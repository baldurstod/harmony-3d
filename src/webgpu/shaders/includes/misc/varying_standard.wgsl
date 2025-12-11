struct VertexOut {
	@builtin(position) position : vec4f,

	@location(0) vVertexPositionModelSpace: vec4f,
	@location(1) vVertexPositionWorldSpace: vec4f,
	@location(2) vVertexPositionCameraSpace: vec4f,

	@location(3) vVertexNormalModelSpace: vec4f,
	@location(4) vVertexNormalWorldSpace: vec3f,
	@location(5) vVertexNormalCameraSpace: vec3f,

	@location(6) vVertexTangentModelSpace: vec4f,
	@location(7) vVertexTangentWorldSpace: vec3f,
	@location(8) vVertexTangentCameraSpace: vec3f,

	@location(9) vVertexBitangentWorldSpace: vec3f,
	@location(10) vVertexBitangentCameraSpace: vec3f,

	@location(11) vTextureCoord: vec4f,
	@location(12) vTexture2Coord: vec4f,

	#ifdef USE_VERTEX_COLOR
		@location(13) vVertexColor: vec4f,
	#endif

	#ifdef WRITE_DEPTH_TO_COLOR
		@location(14) vPosition: vec4f,
	#endif
	#ifdef USE_LOG_DEPTH
		@location(15) vFragDepth: f32,
	#endif
}
