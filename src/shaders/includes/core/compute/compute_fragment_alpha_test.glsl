export default `
#ifndef EXPORT_TEXTURES
	#ifdef ALPHA_TEST
		if (diffuseColor.a < uAlphaTestReference) {
			discard;
		}
	#endif
#endif
`;
