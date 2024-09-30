import { vec3 } from 'gl-matrix';
import { Box } from '../primitives/box';
import { Camera } from '../cameras/camera';
import { Renderer } from '../renderers/renderer';
import { RenderFace } from '../materials/constants';
import { ShaderMaterial } from '../materials/shadermaterial';
import { Texture } from '../textures/texture';
import { TextureMapping } from '../textures/constants';
import { BackGround } from './background';
import { Scene } from '../scenes/scene';

const tempVec3 = vec3.create();

export class CubeBackground extends BackGround {
	#box = new Box();
	#scene = new Scene();
	#material = new ShaderMaterial({ shaderSource: 'skybox' });
	constructor(params: any = {}) {
		super();
		this.#material.depthTest = false;
		this.#material.depthMask = false;
		this.#material.renderFace(RenderFace.Back);
		this.#material.renderLights = false;
		this.#box.material = this.#material;
		this.#scene.addChild(this.#box);

		if (params.texture) {
			this.setTexture(params.texture);
		}
	}

	render(renderer: Renderer, camera: Camera) {
		this.#box.setPosition(camera.getPosition(tempVec3))
		renderer.render(this.#scene, camera, 0);
	}

	setTexture(texture: Texture) {
		this.#material.setTexture('uCubeTexture', texture);
		if (texture.mapping == TextureMapping.CubeUvMapping) {
			this.#material.setDefine('TEXTURE_MAPPING_CUBE_UV');
			const envMapCubeUVSize = generateCubeUVSize(texture.height);
			this.#material.setDefine('CUBEUV_TEXEL_WIDTH', envMapCubeUVSize.texelWidth.toFixed(8));
			this.#material.setDefine('CUBEUV_TEXEL_HEIGHT', envMapCubeUVSize.texelHeight.toFixed(8));
			this.#material.setDefine('CUBEUV_MAX_MIP', envMapCubeUVSize.maxMip.toFixed(2));
		} else {
			this.#material.removeDefine('TEXTURE_MAPPING_CUBE_UV');
		}
	}

	dispose() {
		this.#box.dispose();
	}

	is(s: string): boolean {
		if (s == 'CubeBackground') {
			return true;
		} else {
			return super.is(s);
		}
	}
}


function generateCubeUVSize(height: number) {
	const maxMip = Math.log2(height) - 2;
	const texelHeight = 1.0 / height;
	const texelWidth = 1.0 / (3 * Math.max(Math.pow(2, maxMip), 7 * 16));
	return { texelWidth, texelHeight, maxMip };
}
