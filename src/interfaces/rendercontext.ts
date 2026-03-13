import { vec2 } from 'gl-matrix';
import { Entity } from '../entities/entity';
import { Viewport } from '../graphics/viewport';
import { RenderTarget } from '../textures/rendertarget';

export interface RenderContext {
	DisableToolRendering?: boolean;
	width?: number;
	height?: number;
	/** Transfert the image bitmap after rendering to the offscreen canvas, Default to true. Ignored if Graphics is initialized with useOffscreenCanvas = true */
	transferBitmap?: boolean;
	/** Force rendering even when the canvas is not visible. Default to false. */
	forceRendering?: boolean;
	renderTarget?: RenderTarget | null;
	pick?: {
		canvas: HTMLCanvasElement,
		position: vec2,
		/** For WebGPU context. Picking is done asynchronously */
		resolve?: (value: Entity | null) => void,
	}

	/*
	imageBitmap?: { // TODO: remove
		context: ImageBitmapRenderingContext;
		width: number;
		height: number;
	};
	*/
	/** Compute shaders only. X dimension of the grid of workgroups to dispatch. Default to 1 */
	workgroupCountX?: GPUSize32,
	/** Compute shaders only. Y dimension of the grid of workgroups to dispatch. Default to 1 */
	workgroupCountY?: GPUSize32,
	/** Compute shaders only. Z dimension of the grid of workgroups to dispatch. Default to 1 */
	workgroupCountZ?: GPUSize32
}

export interface InternalRenderContext {
	renderContext: RenderContext;
	width: number;
	height: number;
	viewport?: Viewport;
}
