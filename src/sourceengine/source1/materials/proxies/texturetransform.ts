import { mat4, vec2 } from 'gl-matrix';

import { ProxyManager } from './proxymanager.js';
import { Proxy } from './proxy.js';
import { DEG_TO_RAD } from '../../../../math/constants';

export class TextureTransform extends Proxy {
	centerVar;
	translateVar;
	rotateVar;
	scaleVar;
	resultVar;
	init(variables) {
		this.centerVar = this.getData('centervar');
		this.translateVar = this.getData('translatevar');
		this.rotateVar = this.getData('rotatevar');
		this.scaleVar = this.getData('scalevar');
		this.resultVar = this.getData('resultvar');
		variables.set(this.resultVar, mat4.create());//TODO: fixme
	}

	execute(variables, proxyParams, time) {
		let center = vec2.fromValues(0.5, 0.5);

		const mat = mat4.create();//TODOv3 optimize
		const temp = mat4.create();//TODOv3 optimize

		if (this.centerVar) {
			center = variables.get(this.centerVar) || center;
		}
		MatrixBuildTranslation(mat, -center[0], -center[1], 0.0);

		if (this.scaleVar) {//mat4.identity(out);
			const scale = variables.get(this.scaleVar);
			if (scale) {
				if (typeof scale == 'number') {
					MatrixBuildScale(temp, scale, scale, 1.0);
				} else {
					MatrixBuildScale(temp, scale[0], scale[1], 1.0);
				}
				mat4.mul(mat, temp, mat);
			}
		}

		if (this.rotateVar) {
			const rotate = variables.get(this.rotateVar);
			mat4.identity(temp);
			mat4.rotateZ(temp, temp, DEG_TO_RAD * (rotate));
			//MatrixBuildRotateZ(temp, angle);
			//MatrixMultiply(temp, mat, mat);
			mat4.mul(mat, temp, mat);
		}
		MatrixBuildTranslation(temp, center[0], center[1], 0.0);
		mat4.mul(mat, temp, mat);
		//mat[12] += center[0];
		//mat[13] += center[1];

		if (this.translateVar) {
			const translation = variables.get(this.translateVar);
			MatrixBuildTranslation(temp, translation[0], translation[1], 0.0);
			//MatrixMultiply(temp, mat, mat);
			mat4.mul(mat, temp, mat);
		}

		const v = variables.get(this.resultVar);
		if (v) {
			mat4.copy(v, mat);
		} else {
			variables.set(this.resultVar, mat4.clone(mat));
		}
	}
}
ProxyManager.registerProxy('TextureTransform', TextureTransform);

export function MatrixBuildTranslation(dst, x, y, z) {
	mat4.identity(dst);
	dst[12] = x;
	dst[13] = y;
	dst[14] = z;
}
// Builds a scale matrix
export function MatrixBuildScale(dst, x, y, z) {
	dst[ 0] = x;
	dst[ 1] = 0;
	dst[ 2] = 0;
	dst[ 3] = 0;
	dst[ 4] = 0;
	dst[ 5] = y;
	dst[ 6] = 0;
	dst[ 7] = 0;
	dst[ 8] = 0;
	dst[ 9] = 0;
	dst[10] = z;
	dst[11] = 0;
	dst[12] = 0;
	dst[13] = 0;
	dst[14] = 0;
	dst[15] = 1;
}

/*TextureTransform
 Generates a texture transform matrix for use with $basetexturetransform etc.

centerVar
scaleVar
rotateVar
translateVar
Optional input variables for the matrix. Each one can be a float or a 2D vector.
resultVar


		'TextureTransform'
		{
			'translateVar' '$temp'
			'resultVar' '$basetexturetransform'
		}
*/
