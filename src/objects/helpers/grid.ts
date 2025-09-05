import { GridMaterial } from '../../materials/gridmaterial';
import { Mesh, MeshParameters } from '../../objects/mesh';
import { PlaneBufferGeometry } from '../../primitives/geometries/planebuffergeometry';

export type GridParameters = MeshParameters & {
	size?: number,
	spacing?: number,
	normal?: number,
};


export class Grid extends Mesh {
	#size: number;
	#spacing: number;
	#normal: number;

	constructor(params: GridParameters = {}) {
		const spacing = params.spacing ?? 10;
		params.geometry = new PlaneBufferGeometry();
		params.material = new GridMaterial({ spacing: spacing });
		super(params);
		this.#size = params.size ?? 100;
		this.#spacing = spacing;
		this.#normal = params.normal ?? 2;
		this.#updateGeometry();
	}

	#updateGeometry() {
		(this.geometry as PlaneBufferGeometry).updateGeometry(this.#size, this.#size, 1, 1);
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			Grid_1: null,
			size: { i18n: '#size', f: () => { const size = prompt('Size', String(this.#size)); if (size) { this.#size = Number(size); this.#updateGeometry(); } } },
			spacing: { i18n: '#spacing', f: () => { const spacing = prompt('Spacing', String(this.#spacing)); if (spacing) { this.#spacing = (this.material as GridMaterial).spacing = Number(spacing); } } }
		});
	}
}
