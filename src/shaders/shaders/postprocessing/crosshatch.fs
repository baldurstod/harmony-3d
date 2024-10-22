export default `

#define USE_COLOR_MAP
#include declare_fragment_color_map

#include varying_standard

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / uResolution.xy;

	float lum = length(texture(colorMap, uv).rgb);

	fragColor = vec4(1.0, 1.0, 1.0, 1.0);

	if (lum < 1.00) {
		if (mod(fragCoord.x + fragCoord.y, 10.0) == 0.0) {
			fragColor = vec4(0.0, 0.0, 0.0, 1.0);
		}
	}

	if (lum < 0.75) {
		if (mod(fragCoord.x - fragCoord.y, 10.0) == 0.0) {
			fragColor = vec4(0.0, 0.0, 0.0, 1.0);
		}
	}

	if (lum < 0.50) {
		if (mod(fragCoord.x + fragCoord.y - 5.0, 10.0) == 0.0) {
			fragColor = vec4(0.0, 0.0, 0.0, 1.0);
		}
	}

	if (lum < 0.3) {
		if (mod(fragCoord.x - fragCoord.y - 5.0, 10.0) == 0.0) {
			fragColor = vec4(0.0, 0.0, 0.0, 1.0);
		}
	}
}


void main(void) {
	mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;
