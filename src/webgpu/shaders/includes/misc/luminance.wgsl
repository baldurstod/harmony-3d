fn luminance(color: vec3f) -> f32 {
	return dot(color, vec3f(0.299, 0.587, 0.114));
}
