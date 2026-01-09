fn vec4_transformQuat(a: vec4f, q: vec4f) -> vec4f {
	var ret: vec4f;
	let qx: f32 = q.x;
	let qy: f32 = q.y;
	let qz: f32 = q.z;
	let qw: f32 = q.w;

	let x: f32 = a.x;
	let y: f32 = a.y;
	let z: f32 = a.z;

	// calculate quat * vec
	let ix: f32 = qw * x + qy * z - qz * y;
	let iy: f32 = qw * y + qz * x - qx * z;
	let iz: f32 = qw * z + qx * y - qy * x;
	let iw: f32 = -qx * x - qy * y - qz * z;

	// calculate result * inverse quat
	ret.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	ret.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	ret.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	ret.w = a.w;
	return ret;
}
