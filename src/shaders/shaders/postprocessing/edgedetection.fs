export default `
#define USE_COLOR_MAP
#include declare_fragment_color_map

uniform vec2 uTexSize;
uniform vec3 uVisibleEdgeColor;
uniform vec3 uHiddenEdgeColor;

#include varying_standard

void main(void) {
	vec2 invSize = 1.0 / uTexSize;
	vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);
	vec4 c1 = texture2D( colorMap, vTextureCoord.xy + uvOffset.xy);
	vec4 c2 = texture2D( colorMap, vTextureCoord.xy - uvOffset.xy);
	vec4 c3 = texture2D( colorMap, vTextureCoord.xy + uvOffset.yw);
	vec4 c4 = texture2D( colorMap, vTextureCoord.xy - uvOffset.yw);
	float diff1 = (c1.r - c2.r)*0.5;
	float diff2 = (c3.r - c4.r)*0.5;
	float d = length( vec2(diff1, diff2) );
	float a1 = min(c1.g, c2.g);
	float a2 = min(c3.g, c4.g);
	float visibilityFactor = min(a1, a2);
	vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? uVisibleEdgeColor : uHiddenEdgeColor;
	gl_FragColor = vec4(edgeColor, 1.0) * vec4(d);

	//#include compute_fragment_standard
}
`;
