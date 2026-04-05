import { VariableInfo } from 'wgsl_reflect';

const VIEW_DIMENSIONS: Record<string, GPUTextureViewDimension> = {
	texture_1d: '1d',
	texture_2d: '2d',
	texture_2d_array: '2d-array',
	texture_cube: 'cube',
	texture_cube_array: 'cube-array',
	texture_3d: '3d',

	texture_storage_1d: '1d',
	texture_storage_2d: '2d',
	texture_storage_2d_array: '2d-array',
	texture_storage_3d: '3d',
};

export function getViewDimension(info: VariableInfo): GPUTextureViewDimension {
	const dim = VIEW_DIMENSIONS[info.type.name];
	if (!dim) {
		throw new Error(`unknwon texture type ${info.type.name}`);
	}
	return dim;
}
