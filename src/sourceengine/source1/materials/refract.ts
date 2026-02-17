import { Source1VmtLoader } from '../loaders/source1vmtloader';
import { Source1Material } from './source1material';

export class RefractMaterial extends Source1Material {
	clone() {
		return new RefractMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	override getShaderSource(): string {
		return 'source1_refract';
	}
}
Source1VmtLoader.registerMaterial('refract', RefractMaterial);
