import { RenderFace } from '../../../materials/constants';
import { GL_MAX, GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_SRC_ALPHA } from '../../../webgl/constants';
import { SourceEngineVMTLoader } from '../loaders/source1vmtloader';
import { SourceEngineMaterial, SourceEngineMaterialParams, SourceEngineMaterialVmt } from './source1material';

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
	#initialized = false;

	constructor(repository: string, path: string, vmt: SourceEngineMaterialVmt, params: SourceEngineMaterialParams = {}) {
		super(repository, path, vmt, params);

		// Disable back face culling
		this.renderFace(RenderFace.Both);
		this.colorMask[3] = 0.0;
		this.setDefine('IS_TRANSLUCENT');
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

		switch (Number(vmt['$spriterendermode'])) {
			//TODO: add other modes
			case RenderMode.TransAdd:
				this.setTransparency(GL_SRC_ALPHA, GL_ONE);
				break;
			default:
				break;
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
		return new SpriteMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	get shaderSource() {
		return 'source1_sprite';
	}
}
SourceEngineVMTLoader.registerMaterial('sprite', SpriteMaterial);
