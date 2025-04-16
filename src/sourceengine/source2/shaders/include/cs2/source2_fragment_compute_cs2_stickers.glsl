export default `
	#pragma unroll
	for ( int i = 0; i < 5; i ++ ) {

#ifdef ENABLE_STICKER{i}
#endif
	}
`;
