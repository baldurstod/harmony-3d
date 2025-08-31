import { mat4, vec2, vec3 } from 'gl-matrix';

// TODO: deprecate ?
export function getTexCoordTransform(scale: vec2, translation: vec2, rotation: number) {
	function Vector2DRotate(vIn: vec2, angle: number, vOut: vec2) {
		const c = Math.cos(angle);
		const s = Math.sin(angle);

		vOut[0] = vIn[0] * c - vIn[1] * s;
		vOut[1] = vIn[0] * s + vIn[1] * c;
	}

	const transformMatrix = mat4.create();
	const tempMatrix = mat4.create();
	const tempVec3 = vec3.create();

	tempVec3[0] = translation[0] - 0.5;
	tempVec3[1] = translation[1] - 0.5;
	tempVec3[2] = 0.0;
	mat4.fromTranslation(transformMatrix, tempVec3);

	tempVec3[0] = scale[0];
	tempVec3[1] = scale[1];
	tempVec3[2] = 1.0;
	mat4.fromScaling(tempMatrix, tempVec3);
	mat4.multiply(transformMatrix, transformMatrix, tempMatrix);

	mat4.fromZRotation(tempMatrix, rotation);
	mat4.multiply(transformMatrix, transformMatrix, tempMatrix);

	const offset = vec2.fromValues(0.5 / scale[0], 0.5 / scale[1]);
	//vec2.rotate(offset, offset, vec2.create(), -rotation);
	Vector2DRotate(offset, -rotation, offset);//Vector2DRotate is bugged in CSGO, we have to replicate the bug


	tempVec3[0] = offset[0];
	tempVec3[1] = offset[1];
	tempVec3[2] = 0.0;
	mat4.fromTranslation(tempMatrix, tempVec3);
	mat4.multiply(transformMatrix, transformMatrix, tempMatrix);
	return transformMatrix;
}
