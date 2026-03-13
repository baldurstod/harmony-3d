@group(0) @binding(0) var input: texture_storage_2d<rgba8unorm/*TODO: set a var*/, read>;
@group(0) @binding(1) var<storage, read_write> output: array<f32>;// TODO: handle uint textures
@group(0) @binding(2) var<uniform> size: vec2u;
@group(0) @binding(3) var<uniform> elements: u32;

override WORKGROUP_SIZE_X: u32 = 16;
override WORKGROUP_SIZE_Y: u32 = 16;

@compute @workgroup_size(WORKGROUP_SIZE_X, WORKGROUP_SIZE_Y) fn compute_main(
	@builtin(global_invocation_id) id : vec3u
)
{
	if (any(id.xy >= size) || size.x * size.y * elements > arrayLength(&output)) {
		return;
	}

	let idx = (id.x + id.y * size.x) * elements;

	let color: vec4f = textureLoad(input, id.xy) * 255.;// TODO: handle uint textures

	output[idx + 0] = color.r;
	output[idx + 1] = color.g;
	output[idx + 2] = color.b;
	if (elements == 4) {
		output[idx + 3] = color.a;
	}
}
