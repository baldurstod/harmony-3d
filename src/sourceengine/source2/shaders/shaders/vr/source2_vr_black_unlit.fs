export default `
#include source2_varying_vr_black_unlit

void main(void) {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	#include compute_fragment_standard
}
`;
