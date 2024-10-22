import { SourceEngineMaterial } from './sourceenginematerial';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';

export class RefractMaterial extends SourceEngineMaterial {
	clone() {
		return new RefractMaterial(this.repository, this.fileName, this.parameters);
	}

	getShaderSource() {
		return 'source1_refract';
	}
}
SourceEngineVMTLoader.registerMaterial('refract', RefractMaterial);