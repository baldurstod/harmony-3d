export default `
#ifdef USE_SPECULAR_MAP
	vec4 texelSpecular = texture2D(specularTexture, vTextureCoord.xy);
#endif
`;
