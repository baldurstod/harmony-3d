import { registerEntity } from '../entities/entities';
import { ExtrudeGeometry } from '../geometry/extrudegeometry';
import { FontManager } from '../managers/fontmanager';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { DEG_TO_RAD } from '../math/constants';
import { Interaction } from '../utils/interaction';
import { Mesh } from './mesh';

export class Text3D extends Mesh {
	isText3D = true;
	static defaultFont = 'arial';
	static defaultStyle = 'normal';
	#text: string;
	#size: number;
	#depth: number;
	#font: string;
	#style: string;
	constructor(params: any = {}) {
		super(new ExtrudeGeometry(), params.material ?? new MeshBasicMaterial());
		this.#text = params.text;
		this.#size = params.size ?? 100;
		this.#depth = params.depth ?? 10;
		this.#font = params.font ?? Text3D.defaultFont;
		this.#style = params.style ?? Text3D.defaultStyle;

		this.#updateGeometry();
		this.rotateX(90 * DEG_TO_RAD);

		this.setParameters(params);
	}

	set text(text: string) {
		this.#text = text;
		this.#updateGeometry();
	}

	set size(size: number) {
		this.#size = size;
		this.#updateGeometry();
	}

	set depth(depth: number) {
		this.#depth = depth;
		this.#updateGeometry();
	}

	set font(font: string) {
		this.#font = font;
		this.#updateGeometry();
	}

	set style(style: string) {
		this.#style = style;
		this.#updateGeometry();
	}

	async #updateGeometry() {
		const font = await FontManager.getFont(this.#font);
		if (font) {
			const shapes = font.generateShapes(this.#text, this.#size);

			(this.geometry as ExtrudeGeometry).createGeometry(shapes, { depth: this.#depth, bevelThickness: 2, bevelSize: 0.5 });
		}
	}

	toJSON() {
		const json = super.toJSON();
		json.text = this.#text;
		json.size = this.#size;
		json.depth = this.#depth;
		json.font = this.#font;
		json.style = this.#style;
		return json;
	}

	static async constructFromJSON(json) {
		return new Text3D(json.name);
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.#text = json.text;
		this.#size = json.size;
		this.#depth = json.depth;
		this.#font = json.font ?? Text3D.defaultFont;
		this.#style = json.style ?? Text3D.defaultStyle;
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			Text3D_1: null,
			text: { i18n: '#text', f: () => { const text = prompt('Text', this.#text); this.text = text; } },
			font: {
				i18n: '#font', f: async () => {
					const fontList = await FontManager.getFontList();
					const fontList2 = new Set<string>();
					for (const [fontName, font] of fontList) {
						for (const style of font) {
							fontList2.add(`${fontName}, ${style}`);
						}
					}
					const font = await new Interaction().getString(0, 0, fontList2);
					if (font) {
						this.#font = font[0];
						this.#style = font[1];
						this.#updateGeometry();
					}
				}
			},
			font_size: { i18n: '#font_size', f: () => { const size = prompt('Size', String(this.#size)); this.size = Number(size); } },
			font_depth: { i18n: '#font_depth', f: () => { const depth = prompt('Depth', String(this.#depth)); this.depth = Number(depth); } }
		});
	}

	static getEntityName() {
		return 'Text3D';
	}
}
registerEntity(Text3D);
