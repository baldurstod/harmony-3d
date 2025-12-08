import { uint } from 'harmony-types';

export type WgslType = {
	alignment: number,
	size: uint,
}

const wgslTypeSize = new Map<string, WgslType>();
let initialized = false;

/**
 * Returns the size in bytes of a wgsl type
 * @param type the wgsl type, for instance i32
 * @returns The type size in bytes
 */
export function getWgslTypeSize(type: string): WgslType | undefined {
	if (!initialized) {
		initTypes();
	}
	// TODO: do structs an arrays
	return wgslTypeSize.get(type);
}


function initTypes(): void {
	for (const name in types) {
		const type = types[name]!;
		wgslTypeSize.set(name, { alignment: type[0], size: type[1] });
	}
	initialized = true;
}



const types: Record<string, [number, number,]> = {
	// Scalars
	bool: [4, 4],
	i32: [4, 4],
	u32: [4, 4],
	f32: [4, 4],
	f16: [2, 2],

	// Vectors
	"vec2<bool>": [8, 8],
	"vec2<i32>": [8, 8],
	"vec2<u32>": [8, 8],
	"vec2<f32>": [8, 8],
	"vec2<f16>": [4, 4],
	"vec3<bool>": [16, 16],
	"vec3<i32>": [16, 16],
	"vec3<u32>": [16, 16],
	"vec3<f32>": [16, 16],
	"vec3<f16>": [8, 8],
	"vec4<bool>": [16, 16],
	"vec4<i32>": [16, 16],
	"vec4<u32>": [16, 16],
	"vec4<f32>": [16, 16],
	"vec4<f16>": [8, 8],

	// Matrices
	"mat2x2<f32>": [8, 16],
	"mat2x2<f16>": [4, 8],
	"mat3x2<f32>": [8, 24],
	"mat3x2<f16>": [4, 12],
	"mat4x2<f32>": [8, 32],
	"mat4x2<f16>": [4, 16],
	"mat2x3<f32>": [16, 32],
	"mat2x3<f16>": [8, 16],
	"mat3x3<f32>": [16, 48],
	"mat3x3<f16>": [8, 24],
	"mat4x3<f32>": [16, 64],
	"mat4x3<f16>": [8, 32],
	"mat2x4<f32>": [16, 32],
	"mat2x4<f16>": [8, 16],
	"mat3x4<f32>": [16, 48],
	"mat3x4<f16>": [8, 24],
	"mat4x4<f32>": [16, 64],
	"mat4x4<f16>": [8, 32],
}
