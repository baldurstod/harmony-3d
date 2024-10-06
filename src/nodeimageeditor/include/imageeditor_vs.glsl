export default `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

#ifdef NEED_TWO_TEX_COORDS
varying vec4 vTextureCoord;
#else
varying vec2 vTextureCoord;
#endif

#ifdef TRANSFORM_TEX_COORD
	uniform mat3 uTransformTexCoord0;
#endif

/*imageeditor.vs*/
void main(void) {
	//gl_Position = vec4(aVertexPosition, 1.0);
	#include compute_vertex_projection
#ifdef TRANSFORM_TEX_COORD
	vTextureCoord.xy = vec3(uTransformTexCoord0 * vec3(aTextureCoord, 1.0)).xy;
	#ifdef NEED_TWO_TEX_COORDS
		vTextureCoord.zw = aTextureCoord.xy;
	#endif
#else
	vTextureCoord = aTextureCoord;
#endif

}
`;
