import { Source1VmtLoader } from '../loaders/source1vmtloader';
import { Source1Material } from './source1material';

export class LightMappedGenericMaterial extends Source1Material {//TODOv3 removeme

	clone() {
		return new LightMappedGenericMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	override getShaderSource(): string {
		return 'source1_lightmappedgeneric';
	}
}
Source1VmtLoader.registerMaterial('lightmappedgeneric', LightMappedGenericMaterial);
