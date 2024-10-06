export default `
#ifdef USE_SHEEN_MAP
	uniform samplerCube sheenMap;
#endif
#ifdef USE_SHEEN_MASK_MAP
	uniform sampler2D sheenMaskMap;
#endif

uniform vec4 g_vPackedConst6;
uniform vec4 g_vPackedConst7;
uniform vec3 g_cCloakColorTint;

#define g_flSheenMapMaskScaleX g_vPackedConst6.x // Default = 1.0f
#define g_flSheenMapMaskScaleY g_vPackedConst6.y // Default = 1.0f
#define g_flSheenMapMaskOffsetX g_vPackedConst6.z // Default = 0.0f
#define g_flSheenMapMaskOffsetY g_vPackedConst6.w // Default = 0.0f

#define g_flSheenDirection		g_vPackedConst7.x // 0,1,2 -> XYZ
#define g_flEffectIndex			g_vPackedConst7.y // W
`;
