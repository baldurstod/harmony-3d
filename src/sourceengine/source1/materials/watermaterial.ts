import { RenderFace } from '../../../materials/constants';
import { GL_ONE_MINUS_SRC_ALPHA, GL_SRC_ALPHA } from '../../../webgl/constants';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';
import { SourceEngineMaterial } from './sourceenginematerial';

export class WaterMaterial extends SourceEngineMaterial {
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
SourceEngineVMTLoader.registerMaterial('water', WaterMaterial);
