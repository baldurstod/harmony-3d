import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

// materials/models/items/venomancer/mechamancer/mechamancer_fluid.vmat_c
export class Source2LiquidFx extends Source2Material {// TODO: code me

	get shaderSource() {
		return 'source2_liquid_fx';
	}
}
Source2MaterialLoader.registerMaterial('liquid_fx.vfx', Source2LiquidFx);
