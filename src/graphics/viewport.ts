export class Viewport {
	x: number;
	y: number;
	width: number;
	height: number;

	constructor(params: { x?: number, y?: number, width?: number, height?: number } = {}) {
		this.x = params.x ?? 0;
		this.y = params.y ?? 0;
		this.width = params.width ?? 1;
		this.height = params.height ?? 1;
	}
}
