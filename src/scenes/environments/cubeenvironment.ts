import { Texture } from '../../textures/texture';
import { Environment } from './environment';

export class CubeEnvironment extends Environment {
	texture?: Texture;

	constructor() {
		super();
	}
}
