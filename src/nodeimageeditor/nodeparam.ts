import { vec2 } from 'gl-matrix';

export enum NodeParamType {
	Unknown = 0,
	Int,
	Bool,
	Float,
	Radian,
	Degree,
	String,
	Vec2,
	StickerAdjust,
}

export type NodeParamScalar = number | boolean | vec2 | string;
export type NodeParamArray = number[] | boolean[] | vec2[] | string[];
export type NodeParamValue = NodeParamScalar | NodeParamArray;

export class NodeParam {
	name: string;
	type: NodeParamType;
	value: NodeParamValue;
	length?: number;

	constructor(name: string, type: NodeParamType, value: NodeParamValue, length?: number) {
		this.name = name;
		this.type = type;
		this.value = value;
		this.length = length;
	}
}
