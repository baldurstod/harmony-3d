struct VertexOut {
	@builtin(position) position : vec4f,

	@location(y) vVertexPositionModelSpace: vec4f,
	@location(y) vVertexPositionWorldSpace: vec4f,
	@location(y) vVertexPositionCameraSpace: vec4f,

	@location(y) vVertexNormalModelSpace: vec4f,
	@location(y) vVertexNormalWorldSpace: vec3f,
	@location(y) vVertexNormalCameraSpace: vec3f,

	@location(y) vVertexTangentModelSpace: vec4f,
	@location(y) vVertexTangentWorldSpace: vec3f,
	@location(y) vVertexTangentCameraSpace: vec3f,

	@location(y) vVertexBitangentWorldSpace: vec3f,
	@location(y) vVertexBitangentCameraSpace: vec3f,

	@location(y) vTextureCoord: vec4f,
	@location(y) vTexture2Coord: vec4f,

	#ifdef USE_VERTEX_COLOR
		@location(y) vVertexColor: vec4f,
	#endif

	#ifdef WRITE_DEPTH_TO_COLOR
		@location(y) vPosition: vec4f,
	#endif
	#ifdef USE_LOG_DEPTH
		@location(y) vFragDepth: f32,
	#endif
	#ifdef USE_DETAIL_MAP
		@location(y) vDetailTextureCoord: vec4f,
	#endif
}
