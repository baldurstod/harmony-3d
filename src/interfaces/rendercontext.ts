export interface RenderContext {
	DisableToolRendering?: boolean;
	//width?: number;
	//height?: number;
	imageBitmap?: { // TODO: remove
		context: ImageBitmapRenderingContext;
		width: number;
		height: number;
	};
}
