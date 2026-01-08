struct CommonUniforms {
	time : vec4f,
	resolution: vec4f,
	pointerCoord: vec2f,
	//pickingColor: vec3f,
	//pickedPrimitive : vec3f,
}

@group(0) @binding(x) var<uniform> commonUniforms: CommonUniforms;
#ifdef PICKING_MODE
	@group(0) @binding(x) var<storage, read_write> pickedPrimitive: vec2f;
#endif

#define TIME commonUniforms.time.x
#define FRAME commonUniforms.time.y
