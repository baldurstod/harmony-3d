import { LineMaterial } from '../materials/linematerial';
import { Mesh, MeshParameters } from '../objects/mesh';
import { LineSegmentsGeometry } from './geometries/linesegmentsgeometry';

export const LINE_TYPE_NORMAL = 0;
export const LINE_TYPE_DASHED = 1;
export const LINE_TYPE_DOTTED = 2;

export type LineSegmentsParameters = MeshParameters & {
	lineStrip?: boolean,
};

export class LineSegments extends Mesh {
	#lineStrip: boolean;

	constructor(params: LineSegmentsParameters = {}) {
		params.geometry = new LineSegmentsGeometry();
		params.material = params.material ?? new LineMaterial();
		super(params);
		this.#lineStrip = params.lineStrip ?? true;
	}

	setSegments(positions, colors?) {
		(this.geometry as LineSegmentsGeometry).setSegments(positions, colors, this.#lineStrip);
	}
}
