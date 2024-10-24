export default `
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

uniform mat4 uTextureTransform;

varying vec2 vTextureCoord;

void main(void) {
	vTextureCoord = (uTextureTransform * vec4(aTextureCoord, 1.0, 1.0)).st;
	vec4 vertexPositionModelSpace = vec4(aVertexPosition, 1.0);

	vec4 vertexPositionCameraSpace = uModelViewMatrix * vertexPositionModelSpace;

	gl_Position = uProjectionMatrix * vertexPositionCameraSpace;
}
`;
