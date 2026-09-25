import { Light, LightType } from './light';

/**
 * This class exist to provide a non zero light buffer to webgpu
 */
export class DummyLight extends Light {
	readonly isDummyLight = true;

	static override async constructFromJSON(json: any) {
		return new DummyLight(json);
	}

	static override getEntityName(): string {
		return 'DummyLight';
	}

	override is(s: string): boolean {
		if (s == 'DummyLight') {
			return true;
		} else {
			return super.is(s);
		}
	}

	override getRaytracingLight(): LightType {
		return LightType.Dummy;
	}
}
