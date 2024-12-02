import { GL_SRC_ALPHA, GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_MAX } from '../../../webgl/constants';
import { SourceEngineMaterial } from './sourceenginematerial';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';
import { RenderFace } from '../../../materials/constants';

export class SpriteCardMaterial extends SourceEngineMaterial {
	constructor(params: any = {}) {
		if (params['$color']) {
			params.useSrgb = false;
		}
		super(params);

		// Disable back face culling
		this.renderFace(RenderFace.Both);
		this.colorMask[3] = 0.0;
		this.setDefine('IS_TRANSLUCENT');
		this.setDefine('IS_SPRITE_CARD_MATERIAL');
		this.setDefine('USE_PARTICLE_YAW', '0');//This material never yaw

		if ( /*bAdditive2ndTexture || bAddOverBlend || */params['$addself'] !== undefined) {
			this.setTransparency(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
		} else {
			if (params['$additive'] == 1) {
				this.setTransparency(GL_SRC_ALPHA, GL_ONE);
			} else {
				this.setTransparency(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
			}
		}


		// this material always has blending
		//this.setTransparency(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
		if (params['$additive'] == 1) {
			//this.setTransparency(GL_SRC_ALPHA, GL_ONE);
		}

		/*if (parameters['$addself']) {
			this.setDefine('ALPHA_TEST', false);
		} else {
			this.setDefine('ALPHA_TEST');
			this.uniforms['uAlphaTestReference'] = Number.parseFloat(parameters['$alphatestreference'] || 0.5);
		}*/
		if (params['$addself'] !== undefined) {
			this.uniforms['uAddSelf'] = Number.parseFloat(params['$addself']);
			this.setDefine('ADD_SELF');
			//this.setTransparency(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
		}
		//this.setTransparency(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);


		let overbrightFactor = this.variables.get('$overbrightfactor') ?? this.variables.get('srgb?$overbrightfactor');//TODO: improve this
		this.uniforms['uOverbrightFactor'] = overbrightFactor ?? 1.0;

		//this.modeRGB = GL_MAX;
		this.modeAlpha = GL_MAX;

	}

	clone() {
		return new SpriteCardMaterial(this.parameters);
	}

	get shaderSource() {
		return 'source1_spritecard';
	}
}
SourceEngineVMTLoader.registerMaterial('spritecard', SpriteCardMaterial);
