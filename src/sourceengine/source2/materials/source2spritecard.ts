import { vec2, vec3 } from 'gl-matrix';
import { RenderFace } from '../../../materials/constants';
import { GL_DST_ALPHA, GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_SRC_ALPHA } from '../../../webgl/constants';
import { Source2File } from '../loaders/source2file';
import { Source2MaterialLoader } from '../loaders/source2materialloader';
import { Source2TextureManager } from '../textures/source2texturemanager';
import { Source2Material } from './source2material';

export class Source2SpriteCard extends Source2Material {
	#texturePath = '';

	constructor(repository: string, shader = 'spritecard.vfx', source2File?: Source2File) {
		super(repository, shader, source2File);

		//TODO: we should adapt transparency depending on particle renderer params ?
		this.setTransparency(GL_SRC_ALPHA, GL_DST_ALPHA);
		//this.setTransparency(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
		this.setTransparency(GL_SRC_ALPHA, GL_ONE);
		this.renderFace(RenderFace.Both);
		this.setUniform('uFinalTextureScale', vec2.fromValues(1, 1));
		this.setUniform('uColorScale', vec3.fromValues(1, 1, 1));

		//this.setTransparency( GL_SRC_ALPHA, GL_ONE);
		this.setTransparency(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
	}

	setOutputBlendMode(outputBlendMode: number/*TODO; create enum*/): void {
		switch (outputBlendMode) {
			case 0:
				this.setTransparency(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
				break;
			case 1://PARTICLE_OUTPUT_BLEND_MODE_ADD
				this.setTransparency(GL_SRC_ALPHA, GL_ONE);
				break;
			case 2://PARTICLE_OUTPUT_BLEND_MODE_BLEND_ADD //TODO ?
				this.setTransparency(GL_SRC_ALPHA, GL_ONE);
				break;
			case 3://PARTICLE_OUTPUT_BLEND_MODE_HALF_BLEND_ADD //TODO ?
				this.setTransparency(GL_SRC_ALPHA, GL_ONE);
				break;
			case 4://PARTICLE_OUTPUT_BLEND_MODE_NEG_HALF_BLEND_ADD //TODO ?
				this.setTransparency(GL_SRC_ALPHA, GL_ONE);
				break;
			case 5://PARTICLE_OUTPUT_BLEND_MODE_MOD2X
				this.setTransparency(GL_SRC_ALPHA, GL_DST_ALPHA);
				break;
			case 5://PARTICLE_OUTPUT_BLEND_MODE_LIGHTEN //TODO ?
				this.setTransparency(GL_SRC_ALPHA, GL_ONE);
				break;
		}
	}

	setTexturePath(texturePath: string): void {
		this.#texturePath = texturePath;
	}

	async initTextureUniforms(): Promise<void> {
		await super.initTextureUniforms();
		if (this.#texturePath) {
			this.setTexture('colorMap', await Source2TextureManager.getTexture(this.repository, this.#texturePath, 0), 'USE_COLOR_MAP');
		}
	}

	getFrameSpan(sequence: number): number {
		console.error('code me', sequence);
		return 0;
	}


	override getShaderSource(): string {
		return 'source2_spritecard';
	}
}
Source2MaterialLoader.registerMaterial('spritecard.vfx', Source2SpriteCard);
