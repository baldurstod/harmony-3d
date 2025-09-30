export interface RenderContext {
	DisableToolRendering?: boolean;
	width?: number;
	height?: number;
	/** Transfert the image bitmap after rendering to the offscreen canvas, Default to true. Ignored if Graphics is initialized with useOffscreenCanvas = true */
	transferBitmap?: boolean
	imageBitmap?: { // TODO: remove
		context: ImageBitmapRenderingContext;
		width: number;
		height: number;
	};
}

export interface InternalRenderContext {
	renderContext: RenderContext;
	width: number;
	height: number;
}
