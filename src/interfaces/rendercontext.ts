import { vec2 } from "gl-matrix";
import { RenderTarget } from "../textures/rendertarget";

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
	}

	/*
	imageBitmap?: { // TODO: remove
		context: ImageBitmapRenderingContext;
		width: number;
		height: number;
	};
	*/
}

export interface InternalRenderContext {
	renderContext: RenderContext;
	width: number;
	height: number;
}
