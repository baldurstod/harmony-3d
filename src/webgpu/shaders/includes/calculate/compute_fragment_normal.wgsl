#ifdef FLAT_SHADING
	vec3 fdx = vec3(dFdx(vVertexPositionCameraSpace.x), dFdx(vVertexPositionCameraSpace.y), dFdx(vVertexPositionCameraSpace.z));
	vec3 fdy = vec3(dFdy(vVertexPositionCameraSpace.x), dFdy(vVertexPositionCameraSpace.y), dFdy(vVertexPositionCameraSpace.z));
	vec3 fragmentNormalCameraSpace = normalize(cross(fdx, fdy));
	vec3 fragmentTangentCameraSpace = normalize(fdx);
	vec3 fragmentBitangentCameraSpace = normalize(fdy);
#else
	var<function> fragmentNormalCameraSpace: vec3f = normalize(fragInput.vVertexNormalCameraSpace.xyz);
	var<function> fragmentTangentCameraSpace: vec3f = normalize(fragInput.vVertexTangentCameraSpace.xyz);
	var<function> fragmentBitangentCameraSpace: vec3f = normalize(fragInput.vVertexBitangentCameraSpace.xyz);
#endif
var<function> TBNMatrixCameraSpace: mat3x3<f32> = mat3x3(fragmentTangentCameraSpace, fragmentBitangentCameraSpace, fragmentNormalCameraSpace);
