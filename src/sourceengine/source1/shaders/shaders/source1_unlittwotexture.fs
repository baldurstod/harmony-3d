export default `

uniform sampler2D colorMap;
uniform sampler2D color2Map;

#include source1_varying_unlittwotexture

/*unlittwotexture.fs*/
void main(void) {
		vec4 textureColor = texture2D(colorMap, vTextureCoord.xy);
		vec4 texture2Color = texture2D(color2Map, vTexture2Coord.xy);
		gl_FragColor = textureColor * vColor * textureColor.a;
		//gl_FragColor = vColor;
		//gl_FragColor = vec4(uAddSelf);
		//gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
		//gl_FragColor = vec4(vTextureCoord, 0.0, 1.0);
		gl_FragColor = textureColor * textureColor.a + texture2Color * texture2Color.a;
		//gl_FragColor = texture2Color * texture2Color.a;
		//gl_FragColor = vec4(vTexture2Coord, 0.0, 1.0);
		//gl_FragColor = vec4(vTexture2Coord, 0.0, 1.0);
		gl_FragColor = textureColor * textureColor.a * texture2Color * texture2Color.a;
	#include compute_fragment_standard
}
`;
