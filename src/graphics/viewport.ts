/**
 * Represents the viewport used during the rasterization stage. All values are normalized.
 * x, y, width and height will automaticaly be converted to pixel values before rendering.
 */
export class Viewport {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
	readonly minDepth: number;
	readonly maxDepth: number;

	constructor(params: {
		// A number representing the minimum X value of the viewport. Default to 0.
		x?: number;
		// A number representing the minimum Y value of the viewport. Default to 0.
		y?: number;
		// A number representing the width of the viewport. Default to 1.
		width?: number;
		// A number representing the height of the viewport. Default to 1.
		height?: number;
		// (WebGPU only) A number representing the minimum depth value of the viewport. Default to 0.
		minDepth?: number;
		// (WebGPU only) A number representing the maximum depth value of the viewport. Default to 1.
		maxDepth?: number;
	} = {}) {
		// TODO: check params
		this.x = params.x ?? 0;
		this.y = params.y ?? 0;
		this.width = params.width ?? 1;
		this.height = params.height ?? 1;
		this.minDepth = params.minDepth ?? 0;
		this.maxDepth = params.maxDepth ?? 1;
	}
}
