export default `
uniform float opacity;
uniform sampler2D tDiffuse;

#include varying_standard

void main() {
	vec4 texel = texture2D(tDiffuse, vTextureCoord.xy);
	gl_FragColor = opacity * texel;
	gl_FragColor = vec4(vTextureCoord.xy, 0.0, 1.0);
	texel = texture2D(tDiffuse, vTextureCoord.xy);
	gl_FragColor = texel;
	#include compute_fragment_standard
}
`;
