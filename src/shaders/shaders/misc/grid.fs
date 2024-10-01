export default `
#include declare_fragment_diffuse
#include declare_fragment_color_map

uniform float uSpacing;

#include varying_standard

void main(void) {
	#include compute_fragment_diffuse
	#include compute_fragment_color_map
#ifdef USE_COLOR_MAP
	diffuseColor *= texelColor;
#endif
	gl_FragColor = diffuseColor;

	#include compute_fragment_standard

	float halfSpacing = uSpacing * 0.5;
	float radSpacing = TWO_PI / uSpacing;

	vec4 xLines = saturate(mix(vec4(0.0), vec4(1.0), cos(vVertexPositionWorldSpace.y * radSpacing) * 100.0 - 99.0));
	vec4 yLines = saturate(mix(vec4(0.0), vec4(1.0), cos(vVertexPositionWorldSpace.x * radSpacing) * 100.0 - 99.0));


	if (abs(vVertexPositionWorldSpace.y) < halfSpacing) {
		xLines.gb = vec2(0.0);
	}
	if (abs(vVertexPositionWorldSpace.x) < halfSpacing) {
		yLines.rb = vec2(0.0);
	}

	gl_FragColor = xLines + yLines;
	gl_FragColor.rgb *= gl_FragColor.a;
}
`;
