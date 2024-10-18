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

export class NodeParam {
	name: string;
	type: NodeParamType;
	defaultValue: any;
	value: any;
	length?: number;

	constructor(name: string, type: NodeParamType, defaultValue: any, length?: number) {
		this.name = name;
		this.type = type;
		this.defaultValue = defaultValue;
		this.length = length;
	}
}
