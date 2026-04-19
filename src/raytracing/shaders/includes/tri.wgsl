struct Tri {
	vertex0: vec3f,
	materialIdx: u32,
	vertex1: vec3f,
	flatShading: u32,
	vertex2: vec3f,

	normal0: vec3f,
	normal1: vec3f,
	normal2: vec3f,

	tangent0: vec4f,
	tangent1: vec4f,
	tangent2: vec4f,

	bitangent0: vec3f,
	bitangent1: vec3f,
	bitangent2: vec3f,

	uv0: vec2f,
	uv1: vec2f,
	uv2: vec2f,

	faceNormal: vec3f,
};
