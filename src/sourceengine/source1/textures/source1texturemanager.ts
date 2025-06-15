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
	#vtfList = new Map<string, SourceEngineVTF>();
	#defaultTexture!: Texture;
	#defaultTextureCube!: Texture;
	fallbackRepository = '';

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
		const animatedTexture = this.#getTexture(repository, path, needCubeMap, srgb);

		return ((animatedTexture as AnimatedTexture)?.getFrame ? (animatedTexture as AnimatedTexture).getFrame(frame) : animatedTexture) ?? (needCubeMap ? this.#defaultTextureCube : this.#defaultTexture);
	}

	async getVtf(repository: string, path: string): Promise<SourceEngineVTF | null> {
		let vtf: SourceEngineVTF | null | undefined = this.#vtfList.get(path);
		if (vtf !== undefined) {
			return vtf;
		}

		vtf = await new SourceEngineVTFLoader().load(repository, path);
		if (vtf) {
			this.#vtfList.set(path, vtf);
		}
		return vtf;
	}

	#getTexture(repository: string, path: string, needCubeMap: boolean, srgb = true, allocatedTexture?: AnimatedTexture): Texture | null {
		if (false && TESTING && needCubeMap) {
			return this.#defaultTextureCube;
		}
		path = path.replace(/.vtf$/, '');
		path = path.replace(/.psd/, '');
		path = path.toLowerCase();

		const texture = this.#texturesList.get(path);
		if (texture !== undefined) {
			return texture;
		}

		const pathWithMaterials = 'materials/' + path + '.vtf';//TODOv3
		const fullPath = repository + pathWithMaterials;
		if (!this.#texturesList.has(fullPath)) {
			const animatedTexture = allocatedTexture ?? new AnimatedTexture();//TODOv3: merge with TextureManager.createTexture(); below
			this.setTexture(fullPath, animatedTexture);

			this.getVtf(repository, pathWithMaterials).then(
				(vtf: SourceEngineVTF | null) => {
					if (vtf) {
						vtfToTexture(vtf as SourceEngineVTF, animatedTexture, srgb);
					} else {
						this.#getTexture(this.fallbackRepository, path, needCubeMap, srgb, animatedTexture);
					}
				}
			);
		}
		return this.#texturesList.get(fullPath) ?? null;
	}

	async getTextureAsync(repository: string, path: string, frame: number, needCubeMap: boolean, defaultTexture: Texture, srgb = true) {
		frame = Math.floor(frame);
		path = path.replace(/.vtf$/, '');
		path = path.replace(/.psd/, '');
		path = path.toLowerCase();

		if (this.#texturesList.has(path)) {//Internal texture
			return this.#texturesList.get(path);//.getFrame(frame);//TODOv3: add frame back
		}
		const pathWithMaterials = 'materials/' + path + '.vtf';//TODOv3
		const fullPath = repository + pathWithMaterials;
		if (!this.#texturesList.has(fullPath)) {
			const animatedTexture = new AnimatedTexture();//TODOv3: merge with TextureManager.createTexture(); below
			this.setTexture(fullPath, animatedTexture);
			const vtf = await this.getVtf(repository, pathWithMaterials);

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
		const textureName = this.getInternalTextureName();
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
	const glContext = new Graphics().glContext;
	for (let frameIndex = 0; frameIndex < vtf.frames; frameIndex++) {
		const texture = TextureManager.createTexture();//TODOv3: add params
		texture.properties.set('vtf', vtf);
		texture.setAlphaBits(alphaBits);
		const currentMipMap = vtf.mipmapCount;//TODOv3: choose mipmap
		vtf.fillTexture(new Graphics(), glContext, texture, currentMipMap, frameIndex, srgb);
		animatedTexture.addFrame(frameIndex, texture);
	}
}
