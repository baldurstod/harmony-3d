export default `
float luminance(vec3 color) {
	return dot(color, vec3(0.299, 0.587, 0.114));
}

float luminance(vec4 color) {
	return dot(color.rgb, vec3(0.299, 0.587, 0.114));
}
`;
