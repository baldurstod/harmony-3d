	@location(x) position: vec3f,
	@location(x) normal: vec3f,
	@location(x) texCoord: vec2f,
#ifdef USE_VERTEX_TANGENT
	@location(x) tangent: vec4f,
#endif
#ifdef USE_VERTEX_COLOR
	@location(x) color: vec4f,
#endif
#ifdef USE_TEXTURE_COORD_2
	@location(x) texCoord: vec2f,
#endif
#if defined(SKELETAL_MESH) && defined(HARDWARE_SKINNING)
	@location(x) boneWeights: vec3f,
	@location(x) boneIndices: vec3<u32>,
#endif
