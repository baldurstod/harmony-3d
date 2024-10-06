export default `
varying vec2 vTextureCoord;

uniform sampler2D 	uInputTexture;
uniform float		uSelect[MAX_SELECTORS];

/*select.fs*/
void main(void) {
	vec4 color = texture2D(uInputTexture, vTextureCoord);

	gl_FragColor = vec4(0.0);
	for (int i=0; i < MAX_SELECTORS; i++) {
		if (uSelect[i] > 0.0) {
			if (abs(color.r * 255.0 - uSelect[i]) < 8.0) {
				gl_FragColor = vec4(1.0);
			}
		}
	}
}
`;
