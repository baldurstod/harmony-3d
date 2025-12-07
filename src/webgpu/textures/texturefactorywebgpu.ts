import { Color } from '../../core/color';
import { Graphics } from '../../graphics/graphics2';
import { Texture } from '../../textures/texture';
import { GL_NEAREST, GL_RGB, GL_TEXTURE_2D, GL_TEXTURE_CUBE_MAP, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, GL_TEXTURE_CUBE_MAP_POSITIVE_X, GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_UNSIGNED_BYTE } from '../../webgl/constants';

export function fillCheckerTextureWebGPU(byteArray: Uint8Array, texture: Texture, color: Color, width: number, height: number, needCubeMap: boolean): void {
	throw 'error';
	const context = Graphics.glContext;
	if (needCubeMap) {
		context.bindTexture(GL_TEXTURE_CUBE_MAP, texture.texture);
		context.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
		context.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
		context.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
		context.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
		context.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
		context.texImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
		context.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		context.texParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		context.generateMipmap(GL_TEXTURE_CUBE_MAP);
		context.bindTexture(GL_TEXTURE_CUBE_MAP, null);
	} else {
		context.bindTexture(GL_TEXTURE_2D, texture.texture);//TODOv3: pass param to createTexture and remove this
		context.texImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, byteArray);
		context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
		context.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
		context.generateMipmap(GL_TEXTURE_2D);
		context.bindTexture(GL_TEXTURE_2D, null);
	}
}
