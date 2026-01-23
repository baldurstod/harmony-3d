export default `
varying vec2 vTextureCoord;

uniform sampler2D uInput0;
uniform sampler2D uInput1;
uniform sampler2D uInputWeight;

/*combine_lerp.fs*/
void main(void) {
	vec4 color1 = texture2D(uInput0, vTextureCoord);
	vec4 color2 = texture2D(uInput1, vTextureCoord);
	vec4 color3 = texture2D(uInputWeight, vTextureCoord);
	gl_FragColor = mix(color1, color2, color3.rrrr);
}
`;
