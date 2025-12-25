import { mat4 } from 'gl-matrix';

// Default ortho function correspond to WebGL clip space
export let ortho: (out: mat4, left: number, right: number, bottom: number, top: number, near: number, far: number) => mat4 = mat4.orthoNO;

export function setClipSpaceWebGPU(): void {
	ortho = mat4.orthoZO;
}
