#include raytracer::tri

@group(0) @binding(x) var<storage, read_write> tris: array<Tri>;

override WORKGROUP_SIZE_X: u32;
/**
 * compute the bitangent for each vertex
*/
@compute @workgroup_size(WORKGROUP_SIZE_X, 1)
fn compute_main(@builtin(global_invocation_id) id : vec3<u32>,) {
	if (id.x > arrayLength(&tris)) {
		return;
	}

	let tri = &tris[id.x];

	tri.bitangent0 = cross(tri.normal0, tri.tangent0.xyz) * tri.tangent0.w;
	tri.bitangent1 = cross(tri.normal1, tri.tangent1.xyz) * tri.tangent1.w;
	tri.bitangent2 = cross(tri.normal2, tri.tangent2.xyz) * tri.tangent2.w;
}
