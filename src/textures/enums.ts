export enum TextureCompressionMethod {
	Uncompressed = 0,
	St3c = 1,
	Bptc = 2,
	Rgtc = 3,
}

// TODO (long term): revert to numbers
export enum ImageFormat {
	Unknown = 'Unknown',
	/*
	Dxt1 = 'Dxt1',
	Dxt2 = 'Dxt2',
	Dxt3 = 'Dxt3',
	Dxt4 = 'Dxt4',
	Dxt5 = 'Dxt5',
	*/
	Bc1 = 'Bc1',
	Bc2 = 'Bc2',
	Bc3 = 'Bc3',
	Bc4 = 'Bc4',
	Bc4Signed = 'Bc4Signed',
	Bc5 = 'Bc5',
	Bc5Signed = 'Bc5Signed',
	Bc6 = 'Bc6',
	Bc7 = 'Bc7',
	/*
	Rgtc1 = 'Rgtc1',
	Rgtc1Signed = 'Rgtc1Signed',
	Rgtc2 = 'Rgtc2',
	Rgtc2Signed = 'Rgtc2Signed',
	*/
	R8 = 'R8',
	R8G8B8A8Uint = 'R8G8B8A8Uint',
	BGRA8888 = 'BGRA8888',
	RGBA = 'RGBA',
}

export type ImageFormatS3tc = ImageFormat.Bc1 | ImageFormat.Bc2 | ImageFormat.Bc3;
/*
export enum ImageFormat {
	Unknown = 0,
	Dxt1 = 1,
	Dxt2 = 2,
	Dxt3 = 3,
	Dxt4 = 4,
	Dxt5 = 5,
	Bc1 = 10,
	Bc2 = 11,
	Bc3 = 12,
	Bc4 = 13,
	Bc5 = 14,
	Bc6 = 15,
	Bc7 = 16,
	Rgtc1 = 20,
	Rgtc1Signed = 21,
	Rgtc2 = 22,
	Rgtc2Signed = 23,
	R8 = 1000,
	R8G8B8A8Uint = 1001,
	BGRA8888 = 1002,
}
*/

export function formatCompression(format: ImageFormat): TextureCompressionMethod {
	switch (format) {
		/*
		case ImageFormat.Dxt1:
		case ImageFormat.Dxt2:
		case ImageFormat.Dxt3:
		case ImageFormat.Dxt4:
		case ImageFormat.Dxt5:
			*/
		case ImageFormat.Bc1:
		case ImageFormat.Bc2:
		case ImageFormat.Bc3:
			return TextureCompressionMethod.St3c;
		case ImageFormat.Bc4:
		case ImageFormat.Bc4Signed:
		case ImageFormat.Bc5:
		case ImageFormat.Bc5Signed:
			return TextureCompressionMethod.Rgtc;
		case ImageFormat.Bc6:
		case ImageFormat.Bc7:
			return TextureCompressionMethod.Bptc;
			/*
		case ImageFormat.Rgtc1:
		case ImageFormat.Rgtc1Signed:
		case ImageFormat.Rgtc2:
		case ImageFormat.Rgtc2Signed:
			*/
	}
	return TextureCompressionMethod.Uncompressed;
}
