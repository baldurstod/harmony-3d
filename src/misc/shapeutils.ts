import { vec2, vec3 } from 'gl-matrix';
import { Earcut } from './earcut';

export class ShapeUtils {

	// calculate area of the contour polygon

	static area(contour: vec3[]): number {
		const n = contour.length;
		let a = 0.0;

		for (let p = n - 1, q = 0; q < n; p = q++) {
			a += contour[p]![0] * contour[q]![1] - contour[q]![0] * contour[p]![1];
		}
		return a * 0.5;
	}

	static isClockWise(pts: vec3[]): boolean {

		return ShapeUtils.area(pts) < 0;

	}

	static triangulateShape(contour: vec3[], holes: vec3[][]) {

		const vertices: number[] = []; // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]
		const holeIndices: number[] = []; // array of hole indices
		const faces: [number, number, number][] = []; // final array of vertex indices like [ [ a,b,d ], [ b,c,d ] ]

		removeDupEndPts(contour);
		addContour(vertices, contour);

		//

		let holeIndex = contour.length;

		holes.forEach(removeDupEndPts);

		for (let i = 0; i < holes.length; i++) {
			holeIndices.push(holeIndex);
			holeIndex += holes[i]!.length;
			addContour(vertices, holes[i]!);
		}

		//

		const triangles = Earcut.triangulate(vertices, holeIndices);

		//

		for (let i = 0; i < triangles.length; i += 3) {
			faces.push(triangles.slice(i, i + 3) as [number, number, number]);
		}

		return faces;
	}
}

function removeDupEndPts(points: vec3[]) {

	const l = points.length;

	if (l > 2 && vec2.equals(points[l - 1] as vec2, points[0] as vec2)) {

		points.pop();

	}

}

function addContour(vertices: number[], contour: vec3[]) {
	for (let i = 0; i < contour.length; i++) {
		vertices.push(contour[i]![0]);
		vertices.push(contour[i]![1]);
	}
}
