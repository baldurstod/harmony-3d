export default `
varying vec2 vTextureCoord;

uniform sampler2D uInput[8];
/*combine_add.fs*/
void main(void) {
	gl_FragColor = vec4(0.0);
	gl_FragColor += texture2D(uInput[0], vTextureCoord);
	gl_FragColor += texture2D(uInput[1], vTextureCoord);
	gl_FragColor += texture2D(uInput[2], vTextureCoord);
	gl_FragColor += texture2D(uInput[3], vTextureCoord);
	gl_FragColor += texture2D(uInput[4], vTextureCoord);
	gl_FragColor += texture2D(uInput[5], vTextureCoord);
	gl_FragColor += texture2D(uInput[6], vTextureCoord);
	gl_FragColor += texture2D(uInput[7], vTextureCoord);
}
`;
