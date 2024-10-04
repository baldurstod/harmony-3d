export default `
#include declare_fragment_standard
#include declare_fragment_diffuse
#include declare_lights

#ifdef USE_DASH
	uniform float dashSize;
	uniform float gapSize;
#endif

#include varying_line
void main() {
	#include compute_fragment_diffuse
	#ifdef USE_DASH
		if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps
		if ( mod( vLineDistance, dashSize + gapSize ) > dashSize ) discard; // todo - FIX
	#endif

	if ( abs( vUv.y ) > 1.0 ) {
		float a = vUv.x;
		float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
		float len2 = a * a + b * b;
		if ( len2 > 1.0 ) discard;
	}
	gl_FragColor = vec4( diffuseColor.rgb, diffuseColor.a );
	#include compute_fragment_standard
}
`;
