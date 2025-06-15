import { createElement } from 'harmony-ui';

export function imageDataToImage(imagedata: ImageData, image = new Image()) {
	const canvas = createElement('canvas', { width: imagedata.width, height: imagedata.height }) as HTMLCanvasElement;
	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
	canvas.width = imagedata.width;
	canvas.height = imagedata.height;
	ctx.putImageData(imagedata, 0, 0);

	image.src = canvas.toDataURL();
	return image;
}

export function flipPixelArray(pixelArray: Uint8ClampedArray, width: number, height: number) {
	const rowLength = width * 4
	const tempRow = new Uint8ClampedArray(rowLength);
	const halfHeight = height * 0.5;
	for (let row = 0; row < halfHeight; ++row) {
		const topOffset = row * rowLength;
		const bottomOffset = (height - row - 1) * rowLength;

		tempRow.set(pixelArray.subarray(topOffset, topOffset + rowLength));
		pixelArray.copyWithin(topOffset, bottomOffset, bottomOffset + rowLength);
		pixelArray.set(tempRow, bottomOffset);
	}
}
