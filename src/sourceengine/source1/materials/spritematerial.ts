import { GL_SRC_ALPHA, GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_MAX } from '../../../webgl/constants';
import { SourceEngineMaterial } from './sourceenginematerial';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';
import { RenderFace } from '../../../materials/constants';

enum RenderMode {
	Normal = 0,			// src
	TransColor,			// c*a+dest*(1-a)
	TransTexture,		// src*a+dest*(1-a)
	Glow,				// src*a+dest -- No Z buffer checks -- Fixed size in screen space
	TransAlpha,			// src*srca+dest*(1-srca)
	TransAdd,			// src*a+dest
	Environmental,		// not drawn, used for environmental effects
	TransAddFrameBlend,	// use a fractional frame value to blend between animation frames
	TransAlphaAdd,		// src + dest*(1-a)
	WorldGlow,			// Same as kRenderGlow but not fixed size in screen space
	None,				// Don't render.
}

export class SpriteMaterial extends SourceEngineMaterial {
	constructor(repository: string, fileName: string, parameters: any = {}) {
		super(repository, fileName, parameters);

		// Disable back face culling
		this.renderFace(RenderFace.Both);
		this.colorMask[3] = 0.0;
		this.setDefine('IS_TRANSLUCENT');

		if ( /*bAdditive2ndTexture || bAddOverBlend || */parameters['$addself'] !== undefined) {
			this.setTransparency(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
		} else {
			if (parameters['$additive'] == 1) {
				this.setTransparency(GL_SRC_ALPHA, GL_ONE);
			} else {
				this.setTransparency(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
			}
		}

		switch (Number(parameters['$spriterendermode'])) {
			//TODO: add other modes
			case RenderMode.TransAdd:
				this.setTransparency(GL_SRC_ALPHA, GL_ONE);
				break;
			default:
				break;
		}

		// this material always has blending
		//this.setTransparency(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
		if (parameters['$additive'] == 1) {
			//this.setTransparency(GL_SRC_ALPHA, GL_ONE);
		}

		/*if (parameters['$addself']) {
			this.setDefine('ALPHA_TEST', false);
		} else {
			this.setDefine('ALPHA_TEST');
			this.uniforms['uAlphaTestReference'] = Number.parseFloat(parameters['$alphatestreference'] || 0.5);
		}*/
		if (parameters['$addself'] !== undefined) {
			this.uniforms['uAddSelf'] = Number.parseFloat(parameters['$addself']);
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
		return new SpriteMaterial(this.repository, this.fileName, this.parameters);
	}

	get shaderSource() {
		return 'source1_sprite';
	}
}
SourceEngineVMTLoader.registerMaterial('sprite', SpriteMaterial);
