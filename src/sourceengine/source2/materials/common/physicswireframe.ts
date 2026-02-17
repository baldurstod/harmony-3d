import { Source2MaterialLoader } from '../../loaders/source2materialloader';
import { Source2Material } from '../source2material';

// deadlock/core materials/physics/flat_basic.vmat_c
export class Source2PhyscisWireframe extends Source2Material {// TODO: code me

	override get shaderSource(): string {
		return 'source2_sky';// TODO: create shader
	}
}
Source2MaterialLoader.registerMaterial('physics_wireframe.vfx', Source2PhyscisWireframe);
