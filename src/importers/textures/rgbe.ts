import { decodeRGBE } from '@derschmale/io-rgbe';
import { BinaryReader } from 'harmony-binary-reader';
import { customFetch } from '../../utils/customfetch';
import { TextureManager } from '../../textures/texturemanager';
import { WebGLAnyRenderingContext } from '../../types';
import { TextureFormat, TextureTarget, TextureType } from '../../textures/constants';
import { GL_LINEAR, GL_NEAREST } from '../../webgl/constants';
import { Graphics } from '../../graphics/graphics';

export class RgbeImporter {
	#context: WebGLAnyRenderingContext;
	constructor(context: WebGLAnyRenderingContext) {
		this.#context = context;
	}

	async fetch(url: string) {
		const response = await customFetch(url);
		if (!response.ok) {
			return 'error while fetching resource';
		}

		return this.import(new BinaryReader(await response.arrayBuffer()));
	}

	import(reader: BinaryReader) {
		const rgbe = decodeRGBE(reader.getDataView());
		console.info(rgbe);
		if (!rgbe) {
			return null;
		}

		const params: any = {
			internalFormat: TextureFormat.Rgb_32F,
			flipY: true,
		};

		if (new Graphics().OES_texture_float_linear) {
			params.magFilter = GL_LINEAR;
			params.minFilter = GL_LINEAR;
		} else {
			params.magFilter = GL_NEAREST;
			params.minFilter = GL_NEAREST;
		}

		const texture = TextureManager.createTexture(params);
		texture.setParameters(this.#context, TextureTarget.TEXTURE_2D);
		texture.texImage2D(this.#context, TextureTarget.TEXTURE_2D, rgbe.width, rgbe.height, TextureFormat.Rgb, TextureType.Float, rgbe.data);
		return texture;
	}
}
