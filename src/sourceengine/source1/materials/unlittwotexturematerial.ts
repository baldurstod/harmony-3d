import { mat4 } from 'gl-matrix';

import { GL_SRC_ALPHA, GL_ONE, GL_ONE_MINUS_SRC_ALPHA, GL_MAX } from '../../../webgl/constants';
import { SourceEngineMaterial } from './sourceenginematerial';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';
import { TextureManager } from '../../../textures/texturemanager';
import { Source1TextureManager } from '../textures/source1texturemanager';

const IDENTITY_MATRIX = mat4.create();
const USE_FRAME2 = true;

export class UnlitTwoTextureMaterial extends SourceEngineMaterial {
	constructor(repository, fileName, parameters = Object.create(null)) {//fixme
		super(repository, fileName, parameters);
		if (parameters['$texture2']) {
			this.setColor2Map(Source1TextureManager.getTexture(this.repository, parameters['$texture2'], parameters['$frame2'] || 0));
		} else {
			this.setColor2Map(TextureManager.createCheckerTexture());
		}

		this.setTransparency(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
		if (parameters['$additive'] == 1) {
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
		return new UnlitTwoTextureMaterial(this.repository, this.fileName, this.parameters);
	}

	get shaderSource() {
		return 'source1_unlittwotexture';
	}

	afterProcessProxies() {
		let variables = this.variables;
		let parameters = this.parameters;
		const texture2Transform = variables.get('$texture2transform');
		if (texture2Transform) {
			this.uniforms['uTexture2Transform'] = texture2Transform;
		}


		if (USE_FRAME2) {
			if (parameters['$texture2']) {
				this.setColor2Map(Source1TextureManager.getTexture(this.repository, parameters['$texture2'], parameters['$frame2'] || variables.get('$frame2') || 0));
			}
		}
	}
}
SourceEngineVMTLoader.registerMaterial('unlittwotexture', UnlitTwoTextureMaterial);
