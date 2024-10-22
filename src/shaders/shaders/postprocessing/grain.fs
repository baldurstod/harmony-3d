export default `
#define USE_COLOR_MAP
#include declare_fragment_color_map

uniform float uGrainIntensity;

#include varying_standard

void main(void) {
	float grain = 1.0 - rand(vTextureCoord.xy) * uGrainIntensity;

	gl_FragColor = texture2D(colorMap, vTextureCoord.xy) * vec4(grain, grain, grain, 1.0);
}
`;
