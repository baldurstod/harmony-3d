import { vec3 } from 'gl-matrix';
import { JSONObject } from 'harmony-types';
import { createElement, HarmonyMenuItemsDict } from 'harmony-ui';
import { Camera } from '../cameras/camera';
import { registerEntity } from '../entities/entities';
import { Entity, EntityParameters } from '../entities/entity';
import { FontManager } from '../managers/fontmanager';
import { BlendingMode, RenderFace } from '../materials/constants';
import { Material } from '../materials/material';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { Plane } from '../primitives/plane';
import { Scene } from '../scenes/scene';
import { Texture } from '../textures/texture';
import { TextureManager } from '../textures/texturemanager';
import { Interaction } from '../utils/interaction';

export type Text2DParameters = EntityParameters & {
	text?: string,
	size?: number,
	font?: string,
	style?: string,
	clickable?: boolean,
};

export class Text2D extends Entity {
	isText2D = true;
	#text?: string;
	#size?: number;
	#font?: string;
	//style: string;
	#material = new MeshBasicMaterial({ renderFace: RenderFace.Both, blendingMode: BlendingMode.Normal, defines: { ALWAYS_ON_TOP: '', FACE_CAMERA: '', } });
	#plane = new Plane({ material: this.#material, parent: this, hideInExplorer: true, width: 0, height: 0, });
	#texture?: Texture;
	#pos = vec3.create();

	constructor(params: Text2DParameters = {}) {
		super(params);
		this.setText(params.text);
		this.setSize(params.size);
		this.setFont(params.font);
	}

	setText(text?: string): void {
		this.#text = text;
		this.#updateText();
	}

	setSize(size?: number): void {
		this.#size = size;
		this.#updateText();
	}

	setFont(font?: string): void {
		this.#font = font;
		this.#updateText();
	}

	async #updateText(): Promise<void> {
		const canvas = createElement('canvas') as HTMLCanvasElement;
		const context = canvas.getContext('2d');
		if (!context) {
			return;
		}

		const text = this.#text ?? '';

		let metrics = null;
		const textHeight = 100;
		context.font = 'normal ' + textHeight + 'px Arial';
		metrics = context.measureText(text);
		const textWidth = metrics.width;
		canvas.width = textWidth;
		canvas.height = textHeight;
		context.font = 'normal ' + textHeight + 'px Arial';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillStyle = '#ffffff';
		context.fillText(text, textWidth / 2, textHeight / 2);

		if (this.#texture) {
			// Notice: we delete the texture since webgpu can't resize textures
			TextureManager.deleteTexture(this.#texture);
		}

		this.#material.setColorMap(null);
		this.#plane.setSize(textWidth * 0.01, textHeight * 0.01);

		this.#texture = await TextureManager.createTextureFromCanvas({
			webgpuDescriptor: {
				size: {
					width: textWidth,
					height: textHeight,
				},
				format: 'rgba8unorm',
				usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
			},
			canvas,
			flipY: true,
		});

		this.#material.setColorMap(this.#texture);

		this.#material.setDefine('textWidth', String(textWidth));
		this.#material.setDefine('textHeight', String(textHeight));
	}

	override update(scene: Scene, camera: Camera/*, delta: number*/): void {
		this.getWorldPosition(this.#pos);
		this.#material.setUniformValue('uPosition', this.#pos);
	}

	toJSON(): JSONObject {
		const json = super.toJSON();
		json.text = this.#text;
		json.size = this.#size;
		json.font = this.#font;
		//json.style = this.#style;
		return json;
	}

	/* eslint-disable @typescript-eslint/no-unused-vars */
	/* eslint-disable @typescript-eslint/require-await */
	static override async constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Text2D | null> {
		return new Text2D();// TODO: add params
	}
	/* eslint-enable @typescript-eslint/no-unused-vars */
	/* eslint-enable @typescript-eslint/require-await */

	fromJSON(json: JSONObject): void {
		super.fromJSON(json);
		this.setText(json.text as string);
		this.setSize(json.size as number);
		this.setFont(json.font as string);
		//this.style = json.style as string ?? Text2D.defaultStyle;
	}

	override buildContextMenu(): HarmonyMenuItemsDict {
		return Object.assign(super.buildContextMenu(), {
			Text3D_1: null,
			text: { i18n: '#text', f: () => { const text = prompt('Text', this.#text); this.setText(text ?? undefined); } },
			font: {
				i18n: '#font', f: async () => {
					const fontList = await FontManager.getFontList();
					const fontList2 = new Set<string>();
					for (const [fontName, font] of fontList) {
						for (const style of font) {
							fontList2.add(`${fontName}, ${style}`);
						}
					}
					const font = (await Interaction.getString(0, 0, fontList2)).split(',');
					if (font) {
						this.setFont(font[0]);
						//this.style = font[1]!;
						//this.#update();
					}
				}
			},
			font_size: { i18n: '#font_size', f: () => { const size = prompt('Size', String(this.#size)); this.setSize(Number(size) ?? undefined); } },
		});
	}

	static override getEntityName(): string {
		return 'Text2D';
	}
}
registerEntity(Text2D);
