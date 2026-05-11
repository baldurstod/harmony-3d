import { vec3 } from 'gl-matrix';
import { JSONObject } from 'harmony-types';
import { createElement, display, HarmonyMenuItemsDict } from 'harmony-ui';
import { Camera } from '../cameras/camera';
import { registerEntity } from '../entities/entities';
import { Entity, EntityParameters } from '../entities/entity';
import { FontManager } from '../managers/fontmanager';
import { Material } from '../materials/material';
import { Scene } from '../scenes/scene';
import { Interaction } from '../utils/interaction';

export type Text2DParameters = EntityParameters & {
	text?: string,
	size?: string,
	font?: string,
	style?: string,
	clickable?: boolean,
	parentElement?: HTMLElement,
};

export class Text2D extends Entity {
	isText3D = true;
	#text?: string;
	#size?: string;
	#font?: string;
	//style: string;
	#html = createElement('div', { style: 'position:absolute;pointer-events:none;' });

	constructor(params: Text2DParameters = {}) {
		super(params);
		this.setText(params.text);
		this.setSize(params.size);
		this.setFont(params.font);
		this.setParentElement(params.parentElement);

		display(this.#html, this.isVisible());
	}

	setParentElement(parentElement?: HTMLElement): void {
		parentElement?.append(this.#html);
	}

	override setVisible(visible?: boolean): void {
		super.setVisible(visible);

		display(this.#html, this.isVisible());
	}

	setText(text?: string): void {
		this.#text = text;
		this.#html.innerText = text ?? '';
	}

	setSize(size?: string): void {
		this.#size = size;
		this.#html.style.fontSize = size ?? '';
	}

	setFont(font?: string): void {
		this.#font = font;
		this.#html.style.fontFamily = font ?? '';
	}

	override update(scene: Scene, camera: Camera, delta: number): void {
		const pos = vec3.create();
		const mat = camera.getViewProjectionMatrix();
		vec3.transformMat4(pos, this.getWorldPosition(pos), mat);
		//console.log(pos);
		vec3.scale(pos, pos, 50);
		vec3.add(pos, pos, [50, 50, 0]);
		this.#html.style.left = `${pos[0]}%`;
		this.#html.style.top = `${100 - pos[1]}%`;
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
		this.setSize(json.size as string);
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
					const font = (await new Interaction().getString(0, 0, fontList2)).split(',');
					if (font) {
						this.setFont(font[0]!);
						//this.style = font[1]!;
						//this.#update();
					}
				}
			},
			font_size: { i18n: '#font_size', f: () => { const size = prompt('Size', String(this.#size)); this.setSize(size ?? undefined); } },
		});
	}

	static getEntityName(): string {
		return 'Text2D';
	}
}
registerEntity(Text2D);
