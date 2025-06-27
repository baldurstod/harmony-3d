import { Map2 } from 'harmony-utils';
import { TESTING } from '../../../buildoptions';
import { TEXTURE_CLEANUP_DELAY } from '../../../constants';
import { Graphics } from '../../../graphics/graphics';
import { AnimatedTexture } from '../../../textures/animatedtexture';
import { Texture } from '../../../textures/texture';
import { TextureManager } from '../../../textures/texturemanager';
import { SourceEngineVTFLoader } from '../loaders/sourceenginevtfloader';
import { SourceEngineVTF } from './sourceenginevtf';

let internalTextureId = 0;
class Source1TextureManagerClass extends EventTarget {//TODO: keep event target ?
	#texturesList = new Map2<string, string, AnimatedTexture>();
	#vtfList = new Map2<string, string, SourceEngineVTF>();
	#defaultTexture = new AnimatedTexture();
	#defaultTextureCube = new AnimatedTexture();
	fallbackRepository = '';

	constructor() {
		super();
		new Graphics().ready.then(() => {
			this.#defaultTexture.addFrame(0, TextureManager.createCheckerTexture([127, 190, 255]));
			this.#defaultTextureCube.addFrame(0, TextureManager.createCheckerTexture([127, 190, 255], undefined, undefined, true));
			this.#defaultTexture.addUser(this);
			this.#defaultTextureCube.addUser(this);
		});

		setInterval(() => this.#cleanup(), TEXTURE_CLEANUP_DELAY);
	}

	getTexture(repository: string, path: string, needCubeMap = false, srgb = true): AnimatedTexture | null {
		const animatedTexture = this.#getTexture(repository, path, needCubeMap, srgb);

		return animatedTexture ?? (needCubeMap ? this.#defaultTextureCube : this.#defaultTexture);
	}

	async getVtf(repository: string, path: string): Promise<SourceEngineVTF | null> {
		let vtf: SourceEngineVTF | null | undefined = this.#vtfList.get(repository, path);
		if (vtf !== undefined) {
			return vtf;
		}

		vtf = await new SourceEngineVTFLoader().load(repository, path);
		if (vtf) {
			this.#vtfList.set(repository, path, vtf);
		}
		return vtf;
	}

	#getTexture(repository: string, path: string, needCubeMap: boolean, srgb = true, allocatedTexture?: AnimatedTexture): AnimatedTexture | null {
		if (false && TESTING && needCubeMap) {
			return this.#defaultTextureCube;
		}
		path = path.replace(/.vtf$/, '');
		path = path.replace(/.psd/, '');
		path = path.toLowerCase();

		const texture = this.#texturesList.get(repository, path);
		if (texture !== undefined) {
			return texture;
		}

		const pathWithMaterials = 'materials/' + path + '.vtf';//TODOv3
		//const fullPath = repository + pathWithMaterials;
		if (!this.#texturesList.has(repository, path)) {
			const animatedTexture = allocatedTexture ?? new AnimatedTexture();//TODOv3: merge with TextureManager.createTexture(); below
			this.setTexture(repository, path, animatedTexture);

			this.getVtf(repository, pathWithMaterials).then(
				(vtf: SourceEngineVTF | null) => {
					if (vtf) {
						vtfToTexture(vtf as SourceEngineVTF, animatedTexture, srgb);
					} else {
						//this.#getTexture(this.fallbackRepository, path, needCubeMap, srgb, animatedTexture);
						this.setTexture(repository, path, this.#getTexture(this.fallbackRepository, path, needCubeMap, srgb, animatedTexture));
					}
				}
			);
		}
		return this.#texturesList.get(repository, path) ?? null;
	}

	async getTextureAsync(repository: string, path: string, frame: number, needCubeMap: boolean, defaultTexture?: Texture, srgb = true) {
		frame = Math.floor(frame);
		path = path.replace(/.vtf$/, '');
		path = path.replace(/.psd/, '');
		path = path.toLowerCase();

		const texture = this.#texturesList.get(repository, path);
		if (texture) {
			return texture;//.getFrame(frame);//TODOv3: add frame back
		}
		const pathWithMaterials = 'materials/' + path + '.vtf';//TODOv3
		//const fullPath = repository + pathWithMaterials;

		const animatedTexture = new AnimatedTexture();//TODOv3: merge with TextureManager.createTexture(); below
		this.setTexture(repository, path, animatedTexture);
		const vtf = await this.getVtf(repository, pathWithMaterials);

		if (vtf) {
			vtfToTexture(vtf, animatedTexture, srgb);
		} else {
			this.removeTexture(repository, path);
			return null;
		}

		return (this.#texturesList.get(repository, path) as AnimatedTexture)?.getFrame(frame) ?? defaultTexture ?? (needCubeMap ? this.#defaultTextureCube : this.#defaultTexture);//TODOv3
	}

	getInternalTextureName() {
		return 'source1texturemanager_' + (++internalTextureId);
	}

	addInternalTexture(repository: string, texture?: AnimatedTexture) {
		const textureName = this.getInternalTextureName();
		texture = texture ?? new AnimatedTexture();//TODOv3: add params + create animated texture
		this.setTexture(repository, textureName, texture);
		return { name: textureName, texture: texture };
	}

	setTexture(repository: string, path: string, texture: AnimatedTexture) {
		texture.addUser(this);
		this.#texturesList.set(repository, path, texture);
	}

	removeTexture(repository: string, path: string) {
		const texture = this.#texturesList.get(repository, path);
		if (texture) {
			texture.removeUser(this);
			this.#texturesList.delete(repository, path);
		}
	}

	#cleanup() {
		for (const [repo, path, texture] of this.#texturesList) {
			if (texture.hasOnlyUser(this)) {
				texture.removeUser(this);
				this.#texturesList.delete(repo, path);
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
