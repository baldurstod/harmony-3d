import { RenderFace } from '../../../materials/constants';
import { GL_MAX, GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_SRC_ALPHA } from '../../../webgl/constants';
import { Source1VmtLoader } from '../loaders/source1vmtloader';
import { Source1Material, Source1MaterialParams, Source1MaterialVmt } from './source1material';

export class SpriteCardMaterial extends Source1Material {
	#initialized = false;

	constructor(repository: string, path: string, vmt: Source1MaterialVmt, params: Source1MaterialParams = {}) {
		super(repository, path, vmt, params);
		if (vmt['$color']) {
			this.useSrgb = false;
		}

		// Disable back face culling
		this.renderFace(RenderFace.Both);
		this.colorMask[3] = 0.0;
		this.setDefine('IS_TRANSLUCENT');
		this.setDefine('IS_SPRITE_CARD_MATERIAL');
		this.setDefine('USE_PARTICLE_YAW', '0');//This material never yaw
	}

	init(): void {
		if (this.#initialized) {
			return;
		}
		const vmt = this.vmt;
		this.#initialized = true;
		super.init();

		if ( /*bAdditive2ndTexture || bAddOverBlend || */vmt['$addself'] !== undefined) {
			this.setTransparency(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
		} else {
			if (vmt['$additive'] == 1) {
				this.setTransparency(GL_SRC_ALPHA, GL_ONE);
			} else {
				this.setTransparency(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
			}
		}


		// this material always has blending
		//this.setTransparency(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
		if (vmt['$additive'] == 1) {
			//this.setTransparency(GL_SRC_ALPHA, GL_ONE);
		}

		/*if (parameters['$addself']) {
			this.setDefine('ALPHA_TEST', false);
		} else {
			this.setDefine('ALPHA_TEST');
			this.uniforms['uAlphaTestReference'] = Number.parseFloat(parameters['$alphatestreference'] || 0.5);
		}*/
		if (vmt['$addself'] !== undefined) {
			this.uniforms['uAddSelf'] = Number.parseFloat(vmt['$addself']);
			this.setDefine('ADD_SELF');
			//this.setTransparency(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
		}
		//this.setTransparency(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);


		const overbrightFactor = this.variables.get('$overbrightfactor') ?? this.variables.get('srgb?$overbrightfactor');//TODO: improve this
		this.uniforms['uOverbrightFactor'] = overbrightFactor ?? 1.0;

		//this.modeRGB = GL_MAX;
		this.modeAlpha = GL_MAX;

	}

	clone() {
		return new SpriteCardMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	get shaderSource() {
		return 'source1_spritecard';
	}
}
Source1VmtLoader.registerMaterial('spritecard', SpriteCardMaterial);
