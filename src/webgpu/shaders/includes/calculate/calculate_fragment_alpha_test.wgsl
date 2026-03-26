#ifndef EXPORT_TEXTURES
	#ifdef ALPHA_TEST
		if (diffuseColor.a < alphaTestReference) {
			discard;
		}
	#endif
#endif
