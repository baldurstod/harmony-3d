export default `

#ifndef TONE_MAPPING_EXPOSURE
	#define TONE_MAPPING_EXPOSURE 1.0
#endif
#ifdef TONE_MAPPING
#if TONE_MAPPING == 0
	vec3 ToneMapping( vec3 color ) {
		return color;
	}
#endif
#if TONE_MAPPING == 2 // Reinhard
	vec3 ToneMapping( vec3 color ) {
		color *= TONE_MAPPING_EXPOSURE;
		return saturate( color / ( vec3( 1.0 ) + color ) );

	}
#endif
#endif

`;
