export default `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

#include varying_standard

void main(void) {
	gl_Position = vec4(aVertexPosition.xy, 0.0, 1.0);
	vTextureCoord.xy = aVertexPosition.xy*0.5 + vec2(0.5);
}
`;
