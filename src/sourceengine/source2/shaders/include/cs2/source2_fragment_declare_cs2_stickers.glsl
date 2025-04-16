export default `
#pragma unroll
for ( int i = 0; i < 5; i ++ ) {
#ifdef ENABLE_STICKER{i}
	uniform float g_vSticker{i}Rotation;
	uniform float g_vSticker{i}Wear;
	uniform float g_fWearScratchesSticker{i};
	uniform vec4 g_vSticker{i}Offset;
	uniform vec4 g_vSticker{i}Scale;
	uniform vec4 g_vWearBiasSticker{i};

	uniform sampler2D sticker{i}Map;
	uniform sampler2D normalRoughnessSticker{i}Map;
	uniform sampler2D holoSpectrumSticker{i}Map;
	uniform sampler2D sfxMaskSticker{i}Map;
#endif
}

uniform sampler2D stickerWepInputsMap;
`;
