import { SourceEngineVTFLoader } from '../loaders/sourceenginevtfloader';
import { Graphics } from '../../../graphics/graphics';
import { AnimatedTexture } from '../../../textures/animatedtexture';
import { TextureManager } from '../../../textures/texturemanager';

import { TESTING } from '../../../buildoptions';
import { TEXTURE_CLEANUP_DELAY } from '../../../constants';
import { Texture } from '../../../textures/texture';
import { SourceEngineVTF } from './sourceenginevtf';

let internalTextureId = 0;
class Source1TextureManagerClass extends EventTarget {//TODO: keep event target ?
	#texturesList = new Map<string, Texture>();
	#defaultTexture!: Texture;
	#defaultTextureCube!: Texture;
	fallbackRepository: string = '';

	constructor() {
		super();
		new Graphics().ready.then(() => {
			this.#defaultTexture = TextureManager.createCheckerTexture([127, 190, 255]);
			this.#defaultTextureCube = TextureManager.createCheckerTexture([127, 190, 255], undefined, undefined, true);
			this.#defaultTexture.addUser(this);
			this.#defaultTextureCube.addUser(this);
		});

		setInterval(() => this.#cleanup(), TEXTURE_CLEANUP_DELAY);
	}

	getTexture(repository: string, path: string, frame: number, needCubeMap = false, srgb = true): Texture | null {
		frame = Math.floor(frame);
		let animatedTexture = this.#getTexture(repository, path, needCubeMap, srgb);

		return ((animatedTexture as AnimatedTexture)?.getFrame ? (animatedTexture as AnimatedTexture).getFrame(frame) : animatedTexture) ?? (needCubeMap ? this.#defaultTextureCube : this.#defaultTexture);
	}

	#getTexture(repository: string, path: string, needCubeMap: boolean, srgb = true): Texture | undefined {
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
				(vtf) => vtfToTexture(vtf as SourceEngineVTF, animatedTexture, srgb)
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

	async getTextureAsync(repository: string, path: string, frame: number, needCubeMap: boolean, defaultTexture: Texture, srgb = true) {
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
			let vtf = await new SourceEngineVTFLoader().load(repository, pathWithMaterials) as SourceEngineVTF;

			if (vtf) {
				vtfToTexture(vtf, animatedTexture, srgb);
			} else {
				this.removeTexture(fullPath);
				return null;
			}
		}
		return (this.#texturesList.get(fullPath) as AnimatedTexture)?.getFrame(frame) ?? defaultTexture ?? (needCubeMap ? this.#defaultTextureCube : this.#defaultTexture);//TODOv3
	}

	getInternalTextureName() {
		return 'source1texturemanager_' + (++internalTextureId);
	}

	addInternalTexture(texture?: Texture) {
		let textureName = this.getInternalTextureName();
		texture = texture ?? TextureManager.createTexture();//TODOv3: add params + create animated texture
		this.setTexture(textureName, texture);
		return { name: textureName, texture: texture };
	}

	setTexture(path: string, texture: Texture) {
		texture.addUser(this);
		this.#texturesList.set(path, texture);
	}

	removeTexture(path: string) {
		if (this.#texturesList.has(path)) {
			this.#texturesList.get(path)?.removeUser(this);
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

export function vtfToTexture(vtf: SourceEngineVTF, animatedTexture: AnimatedTexture, srgb: boolean) {
	const alphaBits = vtf.getAlphaBits();
	//animatedTexture.vtf = vtf;
	animatedTexture.setAlphaBits(alphaBits);
	let glContext = new Graphics().glContext;
	for (let frameIndex = 0; frameIndex < vtf.frames; frameIndex++) {
		let texture = TextureManager.createTexture();//TODOv3: add params
		texture.properties.set('vtf', vtf);
		texture.setAlphaBits(alphaBits);
		const currentMipMap = vtf.mipmapCount;//TODOv3: choose mipmap
		vtf.fillTexture(new Graphics(), glContext, texture, currentMipMap, frameIndex, srgb);
		animatedTexture.addFrame(frameIndex, texture);
	}
}
