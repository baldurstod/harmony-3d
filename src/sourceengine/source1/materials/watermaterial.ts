import { RenderFace } from '../../../materials/constants';
import { GL_ONE_MINUS_SRC_ALPHA, GL_SRC_ALPHA } from '../../../webgl/constants';
import { Source1VmtLoader } from '../loaders/source1vmtloader';
import { Source1Material } from './source1material';

export class WaterMaterial extends Source1Material {
	#initialized = false;

	init(): void {
		if (this.#initialized) {
			return;
		}
		this.#initialized = true;
		super.init();

		// Disable back face culling
		this.renderFace(RenderFace.Both);

		this.setTransparency(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
		this.setDefine('IS_TRANSLUCENT');
	}

	clone() {
		return new WaterMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	getShaderSource() {
		return 'source1_water';
	}
}
Source1VmtLoader.registerMaterial('water', WaterMaterial);
