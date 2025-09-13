import { Color } from '../core/color';
import { createTexture, deleteTexture, fillCheckerTexture, fillFlatTexture, fillNoiseTexture, fillTextureWithImage } from '../textures/texturefactory';
import { Texture, TextureParams } from './texture';

export class TextureManager {
	static #texturesList = new Map<string, Texture>();

	static setTexture(path: string, texture: Texture) {
		this.#texturesList.set(path, texture);
	}

	static createTexture(textureParams?: TextureParams) {
		const texture = new Texture(textureParams);
		texture.texture = createTexture();
		//TODOv3: init texture parameters
		//texture.setParameters(Graphics.glContext, target);
		return texture;
	}

	static deleteTexture(texture: Texture) {
		deleteTexture(texture.texture);
	}

	static createFlatTexture(color: Color, needCubeMap = false) {
		const texture = this.createTexture();
		fillFlatTexture(texture, color, needCubeMap);
		return texture;
	}

	static createCheckerTexture(color: Color, width = 64, height = 64, needCubeMap = false) {
		const texture = this.createTexture();
		fillCheckerTexture(texture, color, width, height, needCubeMap);
		return texture;
	}

	static createNoiseTexture(width: number, height: number, needCubeMap = false) {
		const texture = this.createTexture();
		fillNoiseTexture(texture, width, height, needCubeMap);
		return texture;
	}

	static createTextureFromImage(image: HTMLImageElement, textureParams?: TextureParams) {
		const texture = this.createTexture(textureParams);
		fillTextureWithImage(texture, image);
		return texture;
	}

	static fillTextureWithImage(texture: Texture, image: HTMLImageElement) {
		return fillTextureWithImage(texture, image);
	}
}
