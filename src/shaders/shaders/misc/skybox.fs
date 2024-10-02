export default `
#include declare_fragment_standard

#ifdef TEXTURE_MAPPING_CUBE_UV
	#include sample_cube_uv_mapping
	uniform sampler2D uCubeTexture;
#else
	uniform samplerCube uCubeTexture;
#endif

#include varying_standard

void main(void) {
	#include compute_fragment_diffuse
	#include compute_fragment_color_map
#ifdef USE_COLOR_MAP
	diffuseColor *= texelColor;
#endif
	gl_FragColor = diffuseColor;
	gl_FragColor = vec4(vTextureCoord.xy, 0., 1.);
	gl_FragColor.rgb = (normalize(vVertexPositionModelSpace.rgb));
	//gl_FragColor.rgb = texture2D(colorMap, vTextureCoord.xy);


#ifdef TEXTURE_MAPPING_CUBE_UV
	gl_FragColor = textureCubeUV(uCubeTexture, vVertexPositionModelSpace.xyz, 0.);
#else
	gl_FragColor = textureCube(uCubeTexture, vVertexPositionModelSpace.xyz);
#endif

	#include compute_fragment_standard
}
`;
