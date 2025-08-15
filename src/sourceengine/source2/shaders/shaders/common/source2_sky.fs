export default `

#include source2_varying_sky

void main(void) {
	if (length(floor((gl_FragCoord.xy + vec2(15.0)) / 30.0) * 30.0 - gl_FragCoord.xy) > 10.0) {
		discard;
	}
	gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
`;
