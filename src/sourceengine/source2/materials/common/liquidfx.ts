import { Source2MaterialLoader } from '../../loaders/source2materialloader';
import { Source2Material } from '../source2material';

// materials/models/items/venomancer/mechamancer/mechamancer_fluid.vmat_c
// materials/models/items/pudge/pudge_hungry_clown_car/pudge_hungry_clown_car_fluid.vmat_c
// materials/models/items/lion/lion_dungeon_poacher_shoulder/lion_dungeon_poacher_shoulder_jar.vmat_c
export class Source2LiquidFx extends Source2Material {// TODO: code me

	override get shaderSource(): string {
		return 'source2_liquid_fx';
	}
}
Source2MaterialLoader.registerMaterial('liquid_fx.vfx', Source2LiquidFx);
