import { PlaneBufferGeometry } from '../../primitives/geometries/planebuffergeometry';
import { GridMaterial } from '../../materials/gridmaterial';
import { Mesh } from '../../objects/mesh';

export class Grid extends Mesh {
	#size: number;
	#spacing: number;
	#normal: number;
	constructor(params: any = {}) {
		const spacing = params.spacing ?? 10;
		super(new PlaneBufferGeometry(), new GridMaterial({ spacing: spacing }));
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
