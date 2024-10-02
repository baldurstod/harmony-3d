export default `
	IncidentLight directLight;

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );

	GeometricContext geometry;
	geometry.position = vVertexPositionCameraSpace.xyz;
	geometry.normal = fragmentNormalCameraSpace;
	geometry.viewDir = normalize(-vVertexPositionCameraSpace.xyz);
	//TODO: check geometry.worldNormal
	geometry.worldNormal = normalize(vVertexNormalWorldSpace);
	geometry.worldNormal = normalize(fragmentNormalCameraSpace);

`;
