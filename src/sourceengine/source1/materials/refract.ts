import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';
import { SourceEngineMaterial } from './sourceenginematerial';

export class RefractMaterial extends SourceEngineMaterial {
	clone() {
		return new RefractMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	getShaderSource() {
		return 'source1_refract';
	}
}
SourceEngineVMTLoader.registerMaterial('refract', RefractMaterial);
