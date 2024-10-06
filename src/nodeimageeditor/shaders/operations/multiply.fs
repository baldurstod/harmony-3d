export default `
#define INPUT_COUNT 8

varying vec2 vTextureCoord;

uniform sampler2D uInput[INPUT_COUNT];
uniform bool uUsed[INPUT_COUNT];
/*multiply.fs*/
void main(void) {
	gl_FragColor = vec4(1.0);
	if (uUsed[0]) {
		gl_FragColor *= texture2D(uInput[0], vTextureCoord);
	}
	if (uUsed[1]) {
		gl_FragColor *= texture2D(uInput[1], vTextureCoord);
	}
	if (uUsed[2]) {
		gl_FragColor *= texture2D(uInput[2], vTextureCoord);
	}
	if (uUsed[3]) {
		gl_FragColor *= texture2D(uInput[3], vTextureCoord);
	}
	if (uUsed[4]) {
		gl_FragColor *= texture2D(uInput[4], vTextureCoord);
	}
	if (uUsed[5]) {
		gl_FragColor *= texture2D(uInput[5], vTextureCoord);
	}
	if (uUsed[6]) {
		gl_FragColor *= texture2D(uInput[6], vTextureCoord);
	}
	if (uUsed[7]) {
		gl_FragColor *= texture2D(uInput[7], vTextureCoord);
	}
}
`;
