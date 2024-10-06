export default `
varying vec2 vTextureCoord;

uniform float uBorder;
uniform float uRadius;
uniform vec4 uBorderColor;
uniform vec4 uFillColor;
uniform vec2 uCenter;

uniform sampler2D backGround;
uniform sampler2D uMaskTexture;

/* hack to avoid smoothstep undefined behavior when uBorder = 0*/
const float epsilon = 0.000001;

/*drawcircle.fs*/
void main(void) {
	vec4 maskColor = texture2D(uMaskTexture, vTextureCoord);
	vec4 fillColor = vec4(1.0, 0.0, 0.0, 0.0);
	vec2 uv = gl_FragCoord.xy - uCenter;
	float dist = sqrt(dot(uv, uv));
	float t = smoothstep(uRadius-uBorder, uRadius, dist)
			- smoothstep(uRadius, uRadius+uBorder, dist);
	//float t2 = smoothstep(uRadius+uBorder, uRadius-uBorder-epsilon, dist);
	float t2 = 1.0 - smoothstep(uRadius - uBorder, uRadius + uBorder + epsilon, dist);
	//gl_FragColor = (uBorderColor * t + uFillColor * t2) * maskColor;
	gl_FragColor.rgb = (uBorderColor.rgb * t + uFillColor.rgb * t2);
	gl_FragColor.a = 1.0;
	/*gl_FragColor = vec4(1.0, 0.5, 0.25, 0.0);*/
	/*gl_FragColor = vec4(length(gl_FragCoord.xy/8.0));*/
	//gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	//gl_FragColor = vec4(abs(uv) / 100.0, 0.0, 1.0);
	//gl_FragColor = vec4(uv, 0.0, 1.0);
	//gl_FragColor = vec4(dist / 100.0, 0.0, 0.0, 1.0);
	//gl_FragColor = vec4(t2, 0.0, 0.0, 1.0);
	//gl_FragColor = vec4(1.0, 0.5, 0.25, 1.0);
	//gl_FragColor.r += 0.5;
	//gl_FragColor = vec4(dist / 1000.0, 0.0, 0.0, 1.0);
	//gl_FragColor = vec4(t2);
}
`;
