	var directLight = IncidentLight();

	var reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );

	var geometry = GeometricContext();
	geometry.position = fragInput.vVertexPositionCameraSpace.xyz;
	geometry.normal = fragmentNormalCameraSpace;
	geometry.viewDir = normalize(-fragInput.vVertexPositionCameraSpace.xyz);
	//TODO: check geometry.worldNormal
	geometry.worldNormal = normalize(fragInput.vVertexNormalWorldSpace);
	geometry.worldNormal = normalize(fragmentNormalCameraSpace);
