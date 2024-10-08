import { SourceEngineMaterial } from './sourceenginematerial';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';

export class LightMappedGenericMaterial extends SourceEngineMaterial{//TODOv3 removeme
	constructor(repository, fileName, parameters = Object.create(null)) {//fixme
		super(repository, fileName, parameters);
		this.setValues(parameters);
	}

	clone() {
		return new LightMappedGenericMaterial(this.repository, this.fileName, this.parameters);
	}

	getShaderSource() {
		return 'source1_lightmappedgeneric';
	}
}
SourceEngineVMTLoader.registerMaterial('lightmappedgeneric', LightMappedGenericMaterial);
