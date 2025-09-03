import { SourceEngineVMTLoader } from '../loaders/source1vmtloader';
import { SourceEngineMaterial } from './source1material';

export class LightMappedGenericMaterial extends SourceEngineMaterial {//TODOv3 removeme

	clone() {
		return new LightMappedGenericMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	getShaderSource() {
		return 'source1_lightmappedgeneric';
	}
}
SourceEngineVMTLoader.registerMaterial('lightmappedgeneric', LightMappedGenericMaterial);
