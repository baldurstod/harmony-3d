export default `

#define DETAIL_BLEND_MODE_ADD 1
#define DETAIL_BLEND_MODE_ADD_SELF_ILLUM 2
#define DETAIL_BLEND_MODE_MOD2X 3
#define DETAIL_BLEND_MODE_WHAT 4

#ifdef USE_DETAIL1_MAP
	#ifdef DETAIL_BLEND_MODE
		vec4 detailColor;
		#if DETAIL_BLEND_MODE == DETAIL_BLEND_MODE_ADD
			//diffuseColor = diffuseColor + detail1Color * g_flDetailBlendFactor * texelMask1.r;
			detailColor = diffuseColor + detail1Color;
		#elif DETAIL_BLEND_MODE == DETAIL_BLEND_MODE_ADD_SELF_ILLUM
			//diffuseColor = diffuseColor + detail1Color * g_flDetailBlendFactor * texelMask1.r;//TODO selfillum
			detailColor = diffuseColor + detail1Color;//TODO selfillum
		#elif DETAIL_BLEND_MODE == DETAIL_BLEND_MODE_MOD2X
			//diffuseColor = mix(diffuseColor, diffuseColor * detail1Color * g_flDetailBlendFactor, texelMask1.r);//TODO: this is not quite right
			detailColor = 2.0 * diffuseColor * detail1Color;//TODO: this is not quite right
		#elif DETAIL_BLEND_MODE == DETAIL_BLEND_MODE_WHAT
			detailColor = (diffuseColor + detail1Color) * 0.5;
		#endif

		//diffuseColor = mix(diffuseColor, diffuseColor * detail1Color * g_flDetailBlendFactor, texelMask1.r);//TODO: this is not quite right

		diffuseColor = mix(diffuseColor, detailColor, g_flDetailBlendFactor * texelMask1.r);
	#endif
#endif
`;
