import { Node } from './node';

export const IO_TYPE_INT = 1;
export const IO_TYPE_FLOAT = 2;
export const IO_TYPE_VEC2 = 3;
export const IO_TYPE_VEC3 = 4;
export const IO_TYPE_VEC4 = 5;
export const IO_TYPE_QUAT = 6;
export const IO_TYPE_COLOR = 7;
export const IO_TYPE_TEXTURE_2D = 8;

export const IO_TYPE_ARRAY_INT = 101;
export const IO_TYPE_ARRAY_FLOAT = 102;

/*const ARRAY_START = 1000;
export const IO_TYPE_INT_ARRAY = ARRAY_START + 1;
export const IO_TYPE_FLOAT_ARRAY = ARRAY_START + 2;
export const IO_TYPE_VEC2_ARRAY = ARRAY_START + 3;
export const IO_TYPE_VEC3_ARRAY = ARRAY_START + 4;
export const IO_TYPE_VEC4_ARRAY = ARRAY_START + 5;
export const IO_TYPE_QUAT_ARRAY = ARRAY_START + 6;
export const IO_TYPE_COLOR_ARRAY = ARRAY_START + 7;
export const IO_TYPE_TEXTURE_2D_ARRAY = ARRAY_START + 8;*/

export enum InputOutputType {
	Unknown = 0,
	Int,
	Float,
	Vec2,
	Vec3,
	Vec4,
	Quat,
	Color,
	Texture2D,

	IntArray = 1000,
	FloatArray,
}

export class InputOutput {
	node: Node;
	id: string;
	type: InputOutputType;
	size: number;
	_value?: any | any[];
	constructor(node: Node, id: string, type: InputOutputType, size = 1) {
		this.node = node;
		this.id = id;
		this.type = type;
		this.size = size;
		if (size == 1) {
			this._value = undefined;
		} else {
			this._value = new Array(size);
		}
	}
}
