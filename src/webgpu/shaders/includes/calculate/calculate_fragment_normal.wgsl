#ifdef FLAT_SHADING
	let fdx:vec3f = vec3(dpdx(fragInput.vVertexPositionCameraSpace.x), dpdx(fragInput.vVertexPositionCameraSpace.y), dpdx(fragInput.vVertexPositionCameraSpace.z));
	let fdy:vec3f = vec3(dpdy(fragInput.vVertexPositionCameraSpace.x), dpdy(fragInput.vVertexPositionCameraSpace.y), dpdy(fragInput.vVertexPositionCameraSpace.z));
	let fragmentNormalCameraSpace:vec3f = normalize(cross(fdx, fdy));
	let fragmentTangentCameraSpace:vec3f = normalize(fdx);
	let fragmentBitangentCameraSpace:vec3f = normalize(fdy);
#else
	var<function> fragmentNormalCameraSpace: vec3f = normalize(fragInput.vVertexNormalCameraSpace.xyz);
	var<function> fragmentTangentCameraSpace: vec3f = normalize(fragInput.vVertexTangentCameraSpace.xyz);
	var<function> fragmentBitangentCameraSpace: vec3f = normalize(fragInput.vVertexBitangentCameraSpace.xyz);
#endif
var<function> TBNMatrixCameraSpace: mat3x3<f32> = mat3x3(fragmentTangentCameraSpace, fragmentBitangentCameraSpace, fragmentNormalCameraSpace);
