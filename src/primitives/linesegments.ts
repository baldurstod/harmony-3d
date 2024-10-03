import { LineSegmentsGeometry } from './geometries/linesegmentsgeometry';
import { LineMaterial } from '../materials/linematerial'
import { Mesh } from '../objects/mesh';

export const LINE_TYPE_NORMAL = 0;
export const LINE_TYPE_DASHED = 1;
export const LINE_TYPE_DOTTED = 2;

export class LineSegments extends Mesh {
	#lineStrip: boolean;
	constructor(params: any = {}) {
		super(new LineSegmentsGeometry(), params.material ?? new LineMaterial());
		this.#lineStrip = params.lineStrip ?? true;
	}

	setSegments(positions, colors) {
		(this.geometry as LineSegmentsGeometry).setSegments(positions, colors, this.#lineStrip);
	}
}
