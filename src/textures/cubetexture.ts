import { Texture } from './texture';

export class CubeTexture extends Texture {
	isCubeTexture: boolean
	#images?: Array<HTMLImageElement>;
	constructor(parameters: any) {
		super(parameters)
		this.isCubeTexture = true;
		this.setImages(parameters.images);
	}

	setImages(images?: Array<HTMLImageElement>) {
		if (!images) {
			return
		}
		this.#images = images;
	}

	getImages(): Array<HTMLImageElement> | undefined {
		return this.#images;
	}

	getWidth(): number {
		return this.#images?.[0]?.width ?? 0;
	}

	getHeight(): number {
		return this.#images?.[0]?.height ?? 0;
	}

	is(type: string): boolean {
		return type === 'CubeTexture';
	}
}
