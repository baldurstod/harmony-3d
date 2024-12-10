import { createTexture, deleteTexture, fillFlatTexture, fillTextureWithImage, fillCheckerTexture, fillNoiseTexture } from '../textures/texturefactory';
import { Texture, TextureParams } from './texture';

export class TextureManager {
	static #texturesList = new Map<string, Texture>();

	static setTexture(path: string, texture: Texture) {
		this.#texturesList.set(path, texture);
	}

	static createTexture(textureParams?: TextureParams) {
		let texture = new Texture(textureParams);
		texture.texture = createTexture();
		//TODOv3: init texture parameters
		//texture.setParameters(Graphics.glContext, target);
		return texture;
	}

	static deleteTexture(texture: Texture) {
		deleteTexture(texture.texture);
	}

	static createFlatTexture(color = [255, 0, 255], needCubeMap: boolean = false) {
		let texture = this.createTexture();
		fillFlatTexture(texture, color, needCubeMap);
		return texture;
	}

	static createCheckerTexture(color = [255, 0, 255], width: number = 64, height: number = 64, needCubeMap: boolean = false) {
		let texture = this.createTexture();
		fillCheckerTexture(texture, color, width, height, needCubeMap);
		return texture;
	}

	static createNoiseTexture(width: number, height: number, needCubeMap: boolean = false) {
		let texture = this.createTexture();
		fillNoiseTexture(texture, width, height, needCubeMap);
		return texture;
	}

	static createTextureFromImage(image: HTMLImageElement, textureParams?: TextureParams) {
		let texture = this.createTexture(textureParams);
		fillTextureWithImage(texture, image);
		return texture;
	}

	static fillTextureWithImage(texture: Texture, image: HTMLImageElement) {
		return fillTextureWithImage(texture, image);
	}
}
