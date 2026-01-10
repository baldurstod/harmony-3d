import { mat4 } from 'gl-matrix';
import { GL_MAX, GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_SRC_ALPHA } from '../../../webgl/constants';
import { Source1VmtLoader } from '../loaders/source1vmtloader';
import { getDefaultTexture, Source1Material, TextureRole } from './source1material';

const IDENTITY_MATRIX = mat4.create();
const USE_FRAME2 = true;

export class UnlitTwoTextureMaterial extends Source1Material {
	#initialized = false;

	init(): void {
		if (this.#initialized) {
			return;
		}
		const vmt = this.vmt;
		this.#initialized = true;
		super.init();

		if (vmt['$texture2']) {
			this.setColor2Map(this.getTexture(TextureRole.Color2, this.repository, vmt['$texture2'], vmt['$frame2'] as number ?? 0) ?? getDefaultTexture());
		} else {
			this.setColor2Map(getDefaultTexture());
		}

		this.setTransparency(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
		if (vmt['$additive'] == 1) {
			this.setTransparency(GL_SRC_ALPHA, GL_ONE);
			//this.setBlending('additive');
		}
		this.modeAlpha = GL_MAX;


		this.uniforms['uTextureTransform'] = IDENTITY_MATRIX;
		this.uniforms['uTexture2Transform'] = IDENTITY_MATRIX;

		this.setDefine('USE_TEXTURE_TRANSFORM');
		this.setDefine('USE_TEXTURE2_TRANSFORM');

	}

	clone() {
		return new UnlitTwoTextureMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	get shaderSource() {
		return 'source1_unlittwotexture';
	}

	afterProcessProxies() {
		const variables = this.variables;
		const parameters = this.vmt;
		const texture2Transform = variables.get('$texture2transform');
		if (texture2Transform) {
			this.uniforms['uTexture2Transform'] = texture2Transform;
		}


		if (USE_FRAME2) {
			if (parameters['$texture2']) {
				this.setColor2Map(this.getTexture(TextureRole.Color2, this.repository, parameters['$texture2'], parameters['$frame2'] as number ?? variables.get('$frame2') as number ?? 0) ?? getDefaultTexture());
			}
		}
	}
}
Source1VmtLoader.registerMaterial('unlittwotexture', UnlitTwoTextureMaterial);
