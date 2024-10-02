export default `
varying vec4 vVertexPositionModelSpace;
varying vec4 vVertexPositionWorldSpace;
varying vec4 vVertexPositionCameraSpace;


varying vec4 vVertexNormalModelSpace;
varying vec3 vVertexNormalWorldSpace;
varying vec3 vVertexNormalCameraSpace;

varying vec4 vVertexTangentModelSpace;
varying vec3 vVertexTangentWorldSpace;
varying vec3 vVertexTangentCameraSpace;

varying vec3 vVertexBitangentWorldSpace;
varying vec3 vVertexBitangentCameraSpace;

varying vec4 vTextureCoord;
varying vec4 vTexture2Coord;
#ifdef USE_VERTEX_COLOR
	varying vec4 vVertexColor;
#endif

#ifdef WRITE_DEPTH_TO_COLOR
	varying vec4 vPosition;
#endif
#ifdef USE_LOG_DEPTH
	varying float vFragDepth;
#endif
`;
