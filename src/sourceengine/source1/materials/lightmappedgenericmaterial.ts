import { SourceEngineMaterial } from './sourceenginematerial';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';

export class LightMappedGenericMaterial extends SourceEngineMaterial{//TODOv3 removeme
	constructor(params: any = {}) {
		super(params);
		this.setValues(params);
	}

	clone() {
		return new LightMappedGenericMaterial(this.parameters);
	}

	getShaderSource() {
		return 'source1_lightmappedgeneric';
	}
}
SourceEngineVMTLoader.registerMaterial('lightmappedgeneric', LightMappedGenericMaterial);
