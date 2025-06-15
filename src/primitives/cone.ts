import { ConeBufferGeometry } from './geometries/conebuffergeometry';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { Mesh } from '../objects/mesh';
import { registerEntity } from '../entities/entities';

export class Cone extends Mesh {
	#radius: number;
	#height: number;
	#segments: number;
	#hasCap: boolean;
	constructor(params: any = {}) {
		super(new ConeBufferGeometry(), params.material ?? new MeshBasicMaterial());
		super.setParameters(params);
		this.#radius = params.radius ?? 1;
		this.#height = params.height ?? 1;
		this.#segments = params.segments ?? 24;
		this.#hasCap = params.hasCap ?? true;
		this.#updateGeometry();
	}

	#updateGeometry() {
		(this.geometry as ConeBufferGeometry).updateGeometry(this.#radius, this.#height, this.#segments, this.#hasCap);
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			Cone_1: null,
			radius: { i18n: '#radius', f: () => { const radius = prompt('Radius', String(this.#radius)); if (radius) { this.#radius = Number(radius); this.#updateGeometry(); } } },
			height: { i18n: '#height', f: () => { const height = prompt('Height', String(this.#height)); if (height) { this.#height = Number(height); this.#updateGeometry(); } } },
		});
	}

	static getEntityName() {
		return 'Cone';
	}
}
registerEntity(Cone);
