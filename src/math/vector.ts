function isTypedArray(arr: any): boolean {
	return ArrayBuffer.isView(arr) && !(arr instanceof DataView);
}

export function isVec(vec: any): boolean {
	return Array.isArray(vec) || isTypedArray(vec);
}

export function isVec2(vec: any): boolean {
	return isVec(vec) && vec.length === 2;
}

export function isVec3(vec: any): boolean {
	return isVec(vec) && vec.length === 3;
}

export function isVec4(vec: any): boolean {
	return isVec(vec) && vec.length === 4;
}
