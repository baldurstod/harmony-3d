let cameraToFrag: vec3f = normalize (fragInput.vVertexPositionWorldSpace.xyz - matrixUniforms.cameraPosition);
let reflectDir: vec3f = reflect(cameraToFrag, normalize(fragInput.vVertexNormalWorldSpace));
#ifdef USE_CUBE_MAP
	let cubeMapColor: vec4f = textureSample(cubeTexture, cubeSampler, reflectDir);
#endif
