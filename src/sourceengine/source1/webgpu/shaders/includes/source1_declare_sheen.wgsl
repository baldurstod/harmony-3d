#ifdef USE_SHEEN_MAP
	@group(0) @binding(x) var sheenTexture: texture_cube<f32>;
	@group(0) @binding(x) var sheenSampler: sampler;
#endif
#ifdef USE_SHEEN_MASK_MAP
	@group(0) @binding(x) var sheenMaskTexture: texture_2d<f32>;
	@group(0) @binding(x) var sheenMaskSampler: sampler;
#endif

struct SheenUniforms {
	g_vPackedConst6: vec4f,
	g_vPackedConst7: vec4f,
}
@group(0) @binding(x) var<uniform> sheenUniforms : SheenUniforms;
@group(0) @binding(x) var<uniform> g_cCloakColorTint: vec3f;

#define g_flSheenMapMaskScaleX sheenUniforms.g_vPackedConst6.x // Default = 1.0f
#define g_flSheenMapMaskScaleY sheenUniforms.g_vPackedConst6.y // Default = 1.0f
#define g_flSheenMapMaskOffsetX sheenUniforms.g_vPackedConst6.z // Default = 0.0f
#define g_flSheenMapMaskOffsetY sheenUniforms.g_vPackedConst6.w // Default = 0.0f

#define g_flSheenDirection		sheenUniforms.g_vPackedConst7.x // 0,1,2 -> XYZ
#define g_flEffectIndex			sheenUniforms.g_vPackedConst7.y // W
