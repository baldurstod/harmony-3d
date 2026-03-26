fn vectorToColor(vec: vec4f) -> vec4f {
	return ((vec * 0.5) + 0.5);
}

fn colorToVector(color: vec2f) -> vec2f {
	return ((color * 2.0) - 1.0);
}

fn normalizeNormals(normal: vec4f) -> vec4f {
	var normal2 = vec4f(colorToVector(normal.ag), normal.ba);
	normal2.g = -normal.g;
	normal2.b = sqrt(1.0 - dot(normal.rg, normal.rg));

	return vectorToColor(normal2);
}
