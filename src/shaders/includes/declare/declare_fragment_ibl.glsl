export default `
#ifdef USE_IRRADIANCE_TEXTURE
	uniform samplerCube irradianceTexture;
#endif
#ifdef USE_SPECULAR_TEXTURE
	uniform samplerCube specularTexture;
#endif
`;
