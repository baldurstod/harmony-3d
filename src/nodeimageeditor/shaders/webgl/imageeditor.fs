export default `
varying vec2 vTextureCoord;

uniform sampler2D uFinalTexture;

/*imageeditor.fs*/
void main(void) {
	gl_FragColor = texture2D(uFinalTexture, vTextureCoord);
}
`;
