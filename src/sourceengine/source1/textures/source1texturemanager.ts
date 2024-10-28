import { SourceEngineVTFLoader } from '../loaders/sourceenginevtfloader';
import { Graphics } from '../../../graphics/graphics';
import { AnimatedTexture } from '../../../textures/animatedtexture';
import { TextureManager } from '../../../textures/texturemanager';

import { TESTING } from '../../../buildoptions';
import { TEXTURE_CLEANUP_DELAY } from '../../../constants';
import { Texture } from '../../../textures/texture';

let internalTextureId = 0;
class Source1TextureManagerClass extends EventTarget {//TODO: keep event target ?
	#texturesList = new Map();
	#defaultTexture;
	#defaultTextureCube;
	fallbackRepository: string;
	constructor() {
		super();
		Graphics.ready.then(() => {
			this.#defaultTexture = TextureManager.createCheckerTexture([127, 190, 255]);
			this.#defaultTextureCube = TextureManager.createCheckerTexture([127, 190, 255], undefined, undefined, true);
			this.#defaultTexture.addUser(this);
			this.#defaultTextureCube.addUser(this);
		});

		setInterval(() => this.#cleanup(), TEXTURE_CLEANUP_DELAY);
	}

	getTexture(repository, path, frame, needCubeMap = false, srgb = true) {
		frame = Math.floor(frame);
		let animatedTexture = this.#getTexture(repository, path, needCubeMap, srgb);

		return (animatedTexture.getFrame ? animatedTexture.getFrame(frame) : animatedTexture) ?? (needCubeMap ? this.#defaultTextureCube : this.#defaultTexture);
	}

	#getTexture(repository, path, needCubeMap, srgb = true) {
		if (false && TESTING && needCubeMap) {
			return this.#defaultTextureCube;
		}
		path = path.replace(/.vtf$/, '');
		path = path.replace(/.psd/, '');
		path = path.toLowerCase();

		if (this.#texturesList.has(path)) {//Internal texture
			return this.#texturesList.get(path);
		}
		let pathWithMaterials = 'materials/' + path + '.vtf';//TODOv3
		let fullPath = repository + pathWithMaterials;
		if (!this.#texturesList.has(fullPath)) {
			let animatedTexture = new AnimatedTexture();//TODOv3: merge with TextureManager.createTexture(); below
			this.setTexture(fullPath, animatedTexture);
			new SourceEngineVTFLoader().load(repository, pathWithMaterials).then(
				(vtf) => vtfToTexture(vtf, animatedTexture, srgb)
			).catch(
				() => {
					let fallbackTexture = this.#getTexture(this.fallbackRepository, path, needCubeMap);
					if (fallbackTexture) {
						//TODO: dispose of  the previous animatedTexture
						this.setTexture(fullPath, fallbackTexture);
					}
				}
			)
		}
		return this.#texturesList.get(fullPath);
	}

	async getTextureAsync(repository, path, frame, needCubeMap, defaultTexture, srgb = true) {
		frame = Math.floor(frame);
		path = path.replace(/.vtf$/, '');
		path = path.replace(/.psd/, '');
		path = path.toLowerCase();

		if (this.#texturesList.has(path)) {//Internal texture
			return this.#texturesList.get(path);//.getFrame(frame);//TODOv3: add frame back
		}
		let pathWithMaterials = 'materials/' + path + '.vtf';//TODOv3
		let fullPath = repository + pathWithMaterials;
		if (!this.#texturesList.has(fullPath)) {
			let animatedTexture = new AnimatedTexture();//TODOv3: merge with TextureManager.createTexture(); below
			this.setTexture(fullPath, animatedTexture);
			let vtf = await new SourceEngineVTFLoader().load(repository, pathWithMaterials);

			if (vtf) {
				vtfToTexture(vtf, animatedTexture, srgb);
			} else {
				this.removeTexture(fullPath);
				return null;
			}
		}
		return this.#texturesList.get(fullPath)?.getFrame(frame) ?? defaultTexture ?? (needCubeMap ? this.#defaultTextureCube : this.#defaultTexture);//TODOv3
	}

	getInternalTextureName() {
		return 'source1texturemanager_' + (++internalTextureId);
	}

	addInternalTexture(texture?: Texture) {
		let textureName = this.getInternalTextureName();
		texture = texture ?? TextureManager.createTexture();//TODOv3: add params + create animated texture
		this.setTexture(textureName, texture);
		return [textureName, texture];
	}

	setTexture(path, texture) {
		texture.addUser(this);
		this.#texturesList.set(path, texture);
	}

	removeTexture(path) {
		if (this.#texturesList.has(path)) {
			this.#texturesList.get(path).removeUser(this);
			this.#texturesList.delete(path);
		}
	}

	#cleanup() {
		for (const [texturePath, texture] of this.#texturesList) {
			if (texture.hasOnlyUser(this)) {
				texture.removeUser(this);
				this.#texturesList.delete(texturePath);
			}
		}
	}
}
export const Source1TextureManager = new Source1TextureManagerClass();

export function vtfToTexture(vtf, animatedTexture, srgb) {
	const alphaBits = vtf.getAlphaBits();
	animatedTexture.vtf = vtf;
	animatedTexture.setAlphaBits(alphaBits);
	let glContext = Graphics.glContext;
	for (let frameIndex = 0; frameIndex < vtf.frames; frameIndex++) {
		let texture = TextureManager.createTexture();//TODOv3: add params
		texture.properties.set('vtf', vtf);
		texture.setAlphaBits(alphaBits);
		const currentMipMap = vtf.mipmapCount;//TODOv3: choose mipmap
		vtf.fillTexture(Graphics, glContext, texture, currentMipMap, frameIndex, srgb);
		animatedTexture.addFrame(frameIndex, texture);
	}
}
