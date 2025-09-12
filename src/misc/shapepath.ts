import { vec3 } from 'gl-matrix';
import { Path } from '../math/curves/path';
import { Shape } from './shape';
import { ShapeUtils } from './shapeutils';

class ShapePath {
	type = 'ShapePath';
	subPaths: Path[] = [];
	currentPath: Path | null = null;

	moveTo(x: number, y: number): ShapePath {
		this.currentPath = new Path();
		this.subPaths.push(this.currentPath);
		this.currentPath.moveTo([x, y, 0]);

		return this;
	}

	lineTo(x: number, y: number): ShapePath {
		this.currentPath!.lineTo([x, y, 0]);
		return this;
	}

	quadraticCurveTo(aCPx: number, aCPy: number, aX: number, aY: number): ShapePath {
		this.currentPath!.quadraticCurveTo([aCPx, aCPy, 0], [aX, aY, 0]);
		return this;
	}

	bezierCurveTo(aCP1x: number, aCP1y: number, aCP2x: number, aCP2y: number, aX: number, aY: number): ShapePath {
		this.currentPath!.bezierCurveTo([aCP1x, aCP1y, 0], [aCP2x, aCP2y, 0], [aX, aY, 0]);
		return this;
	}

	/*
	splineThru(pts) {
		this.currentPath.splineThru(pts);
		return this;
	}
	*/

	toShapes(isCCW?: boolean, noHoles = false) {

		function toShapesNoHoles(inSubpaths: Path[]) {

			const shapes = [];

			for (let i = 0, l = inSubpaths.length; i < l; i++) {

				const tmpPath = inSubpaths[i]!;

				const tmpShape = new Shape();
				tmpShape.curves = tmpPath.curves;

				shapes.push(tmpShape);

			}

			return shapes;

		}

		function isPointInsidePolygon(inPt: vec3, inPolygon: vec3[]) {

			const polyLen = inPolygon.length;

			// inPt on polygon contour => immediate success    or
			// toggling of inside/outside at every single! intersection point of an edge
			//  with the horizontal line through inPt, left of inPt
			//  not counting lowerY endpoints of edges and whole edges on that line
			let inside = false;
			for (let p = polyLen - 1, q = 0; q < polyLen; p = q++) {

				let edgeLowPt = inPolygon[p]!;
				let edgeHighPt = inPolygon[q]!;

				let edgeDx = edgeHighPt[0] - edgeLowPt[0];
				let edgeDy = edgeHighPt[1] - edgeLowPt[1];

				if (Math.abs(edgeDy) > Number.EPSILON) {

					// not parallel
					if (edgeDy < 0) {

						edgeLowPt = inPolygon[q]!; edgeDx = - edgeDx;
						edgeHighPt = inPolygon[p]!; edgeDy = - edgeDy;

					}

					if ((inPt[1] < edgeLowPt[1]) || (inPt[1] > edgeHighPt[1])) continue;

					if (inPt[1] === edgeLowPt[1]) {

						if (inPt[0] === edgeLowPt[0]) return true;		// inPt is on contour ?
						// continue;				// no intersection or edgeLowPt => doesn't count !!!

					} else {

						const perpEdge = edgeDy * (inPt[0] - edgeLowPt[0]) - edgeDx * (inPt[1] - edgeLowPt[1]);
						if (perpEdge === 0) return true;		// inPt is on contour ?
						if (perpEdge < 0) continue;
						inside = !inside;		// true intersection left of inPt

					}

				} else {

					// parallel or collinear
					if (inPt[1] !== edgeLowPt[1]) continue;			// parallel
					// edge lies on the same horizontal line as inPt
					if (((edgeHighPt[0] <= inPt[0]) && (inPt[0] <= edgeLowPt[0])) ||
						((edgeLowPt[0] <= inPt[0]) && (inPt[0] <= edgeHighPt[0]))) return true;	// inPt: Point on contour !
					// continue;

				}

			}

			return inside;

		}

		const isClockWise = ShapeUtils.isClockWise;

		const subPaths = this.subPaths;
		if (subPaths.length === 0) return [];

		if (noHoles === true) return toShapesNoHoles(subPaths);


		let solid, tmpPath, tmpShape;
		const shapes = [];

		if (subPaths.length === 1) {

			tmpPath = subPaths[0]!;
			tmpShape = new Shape();
			tmpShape.curves = tmpPath.curves;
			shapes.push(tmpShape);
			return shapes;
		}

		let holesFirst = !isClockWise(subPaths[0]!.getPoints());
		holesFirst = isCCW ? !holesFirst : holesFirst;

		// console.log("Holes first", holesFirst);

		const betterShapeHoles: { h: Path, p: vec3 }[][] = [];
		const newShapes = [];
		let newShapeHoles: { h: Path, p: vec3 }[][] = [];
		let mainIdx = 0;
		let tmpPoints;

		newShapes[mainIdx] = undefined;
		newShapeHoles[mainIdx] = [];

		for (let i = 0, l = subPaths.length; i < l; i++) {
			tmpPath = subPaths[i]!;
			tmpPoints = tmpPath.getPoints();
			solid = isClockWise(tmpPoints);
			solid = isCCW ? !solid : solid;

			if (solid) {

				if ((!holesFirst) && (newShapes[mainIdx])) mainIdx++;

				newShapes[mainIdx] = { s: new Shape(), p: tmpPoints };
				newShapes[mainIdx]!.s.curves = tmpPath.curves;

				if (holesFirst) mainIdx++;
				newShapeHoles[mainIdx] = [];

				//console.log('cw', i);

			} else {

				newShapeHoles[mainIdx]!.push({ h: tmpPath, p: tmpPoints[0]! });

				//console.log('ccw', i);

			}

		}

		// only Holes? -> probably all Shapes with wrong orientation
		if (!newShapes[0]) return toShapesNoHoles(subPaths);


		if (newShapes.length > 1) {

			let ambiguous = false;
			const toChange = [];

			for (let sIdx = 0, sLen = newShapes.length; sIdx < sLen; sIdx++) {

				betterShapeHoles[sIdx] = [];

			}

			for (let sIdx = 0, sLen = newShapes.length; sIdx < sLen; sIdx++) {

				const sho = newShapeHoles[sIdx]!;

				for (let hIdx = 0; hIdx < sho.length; hIdx++) {

					const ho = sho[hIdx]!;
					let hole_unassigned = true;

					for (let s2Idx = 0; s2Idx < newShapes.length; s2Idx++) {

						if (isPointInsidePolygon(ho.p, newShapes[s2Idx]!.p)) {

							if (sIdx !== s2Idx) toChange.push({ froms: sIdx, tos: s2Idx, hole: hIdx });
							if (hole_unassigned) {

								hole_unassigned = false;
								betterShapeHoles[s2Idx]!.push(ho);

							} else {

								ambiguous = true;

							}

						}

					}

					if (hole_unassigned) {

						betterShapeHoles[sIdx]!.push(ho);

					}

				}

			}
			// console.log("ambiguous: ", ambiguous);

			if (toChange.length > 0) {

				// console.log("to change: ", toChange);
				if (!ambiguous) newShapeHoles = betterShapeHoles;

			}

		}

		let tmpHoles;

		for (let i = 0, il = newShapes.length; i < il; i++) {

			tmpShape = newShapes[i]!.s;
			shapes.push(tmpShape);
			tmpHoles = newShapeHoles[i]!;

			for (let j = 0, jl = tmpHoles.length; j < jl; j++) {

				tmpShape.holes.push(tmpHoles[j]!.h);

			}

		}

		//console.log("shape", shapes);

		return shapes;

	}

}


export { ShapePath };
