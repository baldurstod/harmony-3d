import { Map2 } from 'harmony-utils';
import { TESTING } from '../../../buildoptions';
import { TEXTURE_CLEANUP_DELAY } from '../../../constants';
import { Color } from '../../../core/color';
import { Graphics } from '../../../graphics/graphics2';
import { AnimatedTexture } from '../../../textures/animatedtexture';
import { Texture } from '../../../textures/texture';
import { DEFAULT_WEBGPU_TEXTURE_DESCRIPTOR, TextureManager } from '../../../textures/texturemanager';
import { Source1VtfLoader } from '../loaders/source1vtfloader';
import { Source1Vtf } from './source1vtf';

let internalTextureId = 0;

function cleanupPath(path: string): string {
	path = path.replace(/\.vtf$/, '');
	path = path.replace(/\.psd/, '');
	path = path.replace('\\', '/');
	return path.toLowerCase();
}

class Source1TextureManagerClass {
	#texturesList = new Map2<string, string, AnimatedTexture>();
	#vtfList = new Map2<string, string, Source1Vtf>();
	#defaultTexture = new AnimatedTexture();
	#defaultTextureCube = new AnimatedTexture();
	fallbackRepository = '';

	constructor() {
		Graphics.ready.then(() => {
			this.#defaultTexture.addFrame(0, TextureManager.createCheckerTexture({
				webgpuDescriptor: {
					format: 'rgba8unorm',
					usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
				},
				color: new Color(0.5, 0.75, 1),
			}));
			this.#defaultTextureCube.addFrame(0, TextureManager.createCheckerTexture({
				webgpuDescriptor: {
					format: 'rgba8unorm',
					usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
				},
				color: new Color(0.5, 0.75, 1),
				needCubeMap: true,				//new Color(0.5, 0.75, 1), undefined, undefined, true
			}));
			this.#defaultTexture.addUser(this);
			this.#defaultTextureCube.addUser(this);
		});

		setInterval(() => this.#cleanup(), TEXTURE_CLEANUP_DELAY);
	}

	getTexture(repository: string, path: string, needCubeMap = false, srgb = true): AnimatedTexture | null {
		const animatedTexture = this.#getTexture(repository, path, needCubeMap, srgb);

		return animatedTexture ?? (needCubeMap ? this.#defaultTextureCube : this.#defaultTexture);
	}

	async getVtf(repository: string, path: string): Promise<Source1Vtf | null> {
		// TODO: fix that concurent calls of the same texture will load it multiple times
		let vtf: Source1Vtf | null | undefined = this.#vtfList.get(repository, path);
		if (vtf !== undefined) {
			return vtf;
		}

		vtf = await new Source1VtfLoader().load(repository, path);
		if (vtf) {
			this.#vtfList.set(repository, path, vtf);
		}
		return vtf;
	}

	#getTexture(repository: string, path: string, needCubeMap: boolean, srgb = true, allocatedTexture?: AnimatedTexture): AnimatedTexture | null {
		if (false && TESTING && needCubeMap) {
			return this.#defaultTextureCube;
		}
		path = cleanupPath(path);

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
				(vtf: Source1Vtf | null) => {
					if (vtf) {
						vtfToTexture(vtf as Source1Vtf, animatedTexture, srgb);
					} else {
						const texture = this.#getTexture(this.fallbackRepository, path, needCubeMap, srgb, animatedTexture);
						if (texture) {
							this.setTexture(repository, path, texture);
						}
					}
				}
			);
		}
		return this.#texturesList.get(repository, path) ?? null;
	}

	async getTextureAsync(repository: string, path: string, frame: number, needCubeMap: boolean, defaultTexture?: Texture, srgb = true): Promise<Texture | null> {
		frame = Math.floor(frame);
		path = cleanupPath(path);

		const texture = this.#texturesList.get(repository, path);
		if (texture) {
			return texture.getFrame(frame) ?? null;
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

	#getInternalTextureName() {
		return 'source1texturemanager_' + (++internalTextureId);
	}

	addInternalTexture(repository: string, path?: string, texture?: AnimatedTexture): { name: string, texture: AnimatedTexture } {
		const textureName = path ?? this.#getInternalTextureName();
		texture = texture ?? new AnimatedTexture();//TODOv3: add params + create animated texture
		this.setTexture(repository, textureName, texture);
		texture.addFrame(0, TextureManager.createTexture({ webgpuDescriptor: DEFAULT_WEBGPU_TEXTURE_DESCRIPTOR }));
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

export function vtfToTexture(vtf: Source1Vtf, animatedTexture: AnimatedTexture, srgb: boolean): void {
	const alphaBits = vtf.getAlphaBits();
	//animatedTexture.vtf = vtf;
	animatedTexture.setAlphaBits(alphaBits);
	const glContext = Graphics.glContext;
	const currentMipMap = vtf.mipmapCount;//TODOv3: choose mipmap
	const size = vtf.getMipMapSize(currentMipMap);
	if (!size) {
		return;
	}

	for (let frameIndex = 0; frameIndex < vtf.frames; frameIndex++) {

		const texture = TextureManager.createTexture({
			webgpuDescriptor: {
				size: {
					width: size.width,
					height: size.height,
				},
				format: 'rgba8unorm',
				usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
			}
		});//TODOv3: add params
		texture.properties.set('vtf', vtf);
		texture.setAlphaBits(alphaBits);
		vtf.fillTexture(glContext, texture, currentMipMap, frameIndex, srgb);
		animatedTexture.addFrame(frameIndex, texture);
	}
}
