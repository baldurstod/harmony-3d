export default `
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
#ifdef USE_VERTEX_TANGENT
	attribute vec4 aVertexTangent;//TODO: setup a define tangent is not used everywhere
#endif
#ifdef USE_VERTEX_COLOR
	attribute vec4 aVertexColor;
#endif
attribute vec2 aTextureCoord;
#ifdef USE_TEXTURE_COORD_2
	attribute vec2 aTextureCoord2;
#endif
#ifdef HARDWARE_SKINNING
	#ifdef SKELETAL_MESH
		attribute vec3 aBoneWeight;
		attribute vec3 aBoneIndices;
	#endif
#endif
`;
