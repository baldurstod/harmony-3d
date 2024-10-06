export default `
varying vec4 vTextureCoord;
uniform sampler2D uSticker;
uniform sampler2D uStickerSpecular;
uniform sampler2D uInput;

/*applysticker.fs*/
void main(void) {
	vec4 inputColor = texture2D(uInput, vTextureCoord.zw);
	vec4 stickerColor = texture2D(uSticker, vTextureCoord.xy);
	vec4 specularColor = texture2D(uStickerSpecular, vTextureCoord.xy);
	gl_FragColor = vec4((1.0 - stickerColor.a) * inputColor.xyz + stickerColor.a * stickerColor.xyz,
						(1.0 - stickerColor.a) * inputColor.a + stickerColor.a * specularColor.r);
}
`;

//TODO: sticker specular
/*
				float3 tmpColor = ( 1.0 - color1.a ) * color0.xyz
								+ ( color1.a )       * color1.xyz;

				float tmpSpecular = ( 1.0 - color1.a ) * color0.w
				                  + ( color1.a )       * srcSpecular;

				return float4( tmpColor.xyz, tmpSpecular );
				*/
