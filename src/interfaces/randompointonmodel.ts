import { vec3 } from 'gl-matrix';
import { Bone } from '../objects/bone';
import { ControlPoint } from '../sourceengine/export';
import { int32 } from 'harmony-types';

export interface RandomPointOnModel {
	/**
	 * Get a random point on a model and returns the hitbox index
	 *
	 * @param out The receiving vector
	 * @param initialVec The receiving vector for the initial random point
	 * @param controlPoint The control point used to determine the model
	 * @param numTriesToGetAPointInsideTheModel If non zero try to get a point inside the model
	 * @param directionBias Direction bias. If direction bias is non zero, tries is set to a minimum of 5
	 * @param boundingBoxScale Scale of the bounding box. Must be in the 0..1 range
	 * @param bones The receiving array to store the bone(s) this particle will be linked to
	 * @param hitBoxRelativeCoordOut TODO: doc
	 */
	getRandomPointOnModel(
		out: vec3,
		initialVec: vec3,
		controlPoint: ControlPoint,
		numTriesToGetAPointInsideTheModel: int32,
		directionBias: vec3,
		boundingBoxScale: number,
		bones: [Bone, number][],
		hitBoxRelativeCoordOut: vec3 | undefined,
	): int32;
}
