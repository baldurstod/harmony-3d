export default `
#include declare_fragment_color_map

#include source2_varying_csgo_weapon_stattrak
void main(void) {
#ifdef USE_COLOR_MAP
	gl_FragColor = texture2D(colorMap, vTextureCoord.xy * vec2(6. / 16., 0.08));
	//gl_FragColor = texture2D(colorMap, vTextureCoord.xy);
#endif
}
`;
