export default `
vec3 cameraToFrag = normalize (vVertexPositionWorldSpace.xyz - uCameraPosition);
vec3 reflectDir = reflect(cameraToFrag, normalize(vVertexNormalWorldSpace));
#ifdef USE_CUBE_MAP
	vec4 cubeMapColor = textureCube(cubeTexture, reflectDir);
#endif
`;
