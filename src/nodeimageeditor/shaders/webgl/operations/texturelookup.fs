export default `
varying vec2 vTextureCoord;

uniform sampler2D uInput;
uniform float uRotateAngle;
uniform vec2 uUVTranslate;
uniform vec2 uUVScale;


uniform vec4 uAdjustLevels;
#define g_AdjustInBlack(n)		uAdjustLevels.x
#define g_AdjustInWhite(n)		uAdjustLevels.y
#define g_AdjustGamma(n)		uAdjustLevels.z

#include nodeimageeditor_declare_functions

/*texturelookup.fs*/
void main(void) {
	vec4 color0 = texture2D(uInput, vTextureCoord);
	gl_FragColor = AdjustLevels(color0, g_AdjustInBlack(0), g_AdjustInWhite(0), g_AdjustGamma(0));
	//gl_FragColor = vec4(g_AdjustInWhite(0));
}
`;
