export interface RenderContext {
	DisableToolRendering?: boolean;
	width?: number;
	height?: number;
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
