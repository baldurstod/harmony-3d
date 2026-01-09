fn rotationMatrix(axis: vec3f, angle: f32) -> mat4x4f{
	let a: vec3f = normalize(axis);
	let s: f32 = sin(angle);
	let c: f32 = cos(angle);
	let oc: f32 = 1.0 - c;

	return mat4x4f(oc * a.x * a.x + c,			oc * a.x * a.y - a.z * s,	oc * a.z * a.x + a.y * s,	0.0,
				oc * a.x * a.y + a.z * s,	oc * a.y * a.y + c,			oc * a.y * a.z - a.x * s,	0.0,
				oc * a.z * a.x - a.y * s,	oc * a.y * a.z + a.x * s,	oc * a.z * a.z + c,			0.0,
				0.0,								0.0,								0.0,								1.0);
}
