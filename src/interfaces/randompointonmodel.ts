import { vec3 } from 'gl-matrix';
import { Bone } from '../objects/bone';

export interface RandomPointOnModel {
	getRandomPointOnModel(vec: vec3, initialVec: vec3, bones: [Bone, number][]): vec3;
}
