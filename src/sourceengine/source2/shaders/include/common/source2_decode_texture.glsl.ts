export default `

vec4 vectorToColor(vec4 vec) {
	return ((vec * 0.5) + 0.5);
}

vec2 colorToVector(vec2 color) {
	return ((color * 2.0) - 1.0);
}

vec4 normalizeNormals(vec4 normal) {
	normal.rg = colorToVector(normal.ag);
	normal.g = -normal.g;
	normal.b = sqrt(1.0 - dot(normal.rg, normal.rg));

	return vectorToColor(normal);
}
`;
