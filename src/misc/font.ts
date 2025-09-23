import { JSONObject } from 'harmony-types';
import { ShapePath } from './shapepath';

export class Font {
	#json: any;

	constructor(json: JSONObject) {
		this.#json = json;
	}

	generateShapes(text: string, size = 100) {
		const shapes = [];
		const paths = this.createPaths(text, size);

		for (const path of paths) {
			shapes.push(...path.toShapes());
		}
		return shapes;
	}

	createPaths(text = '', size = 1) {
		const data = this.#json;
		const chars = Array.from(text);
		const scale = size / data.resolution;
		const line_height = (data.boundingBox.yMax - data.boundingBox.yMin + data.underlineThickness) * scale;

		const paths = [];

		let offsetX = 0, offsetY = 0;

		for (const char of chars) {
			if (char === '\n') {
				offsetX = 0;
				offsetY -= line_height;
			} else {
				const ret = this.createPath(char, scale, offsetX, offsetY);
				offsetX += ret.offsetX;
				paths.push(ret.path);
			}
		}
		return paths;
	}

	createPath(char: string, scale: number, offsetX: number, offsetY: number) {
		const data = this.#json;

		const glyph = data.glyphs[char] ?? data.glyphs['?'];

		const path = new ShapePath();

		let x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2;

		if (glyph.o) {
			const outline = glyph.o.split(' ');

			for (let i = 0, l = outline.length; i < l;) {
				const action = outline[i++];

				switch (action) {
					case 'm': // moveTo
						x = outline[i++] * scale + offsetX;
						y = outline[i++] * scale + offsetY;
						path.moveTo(x, y);
						break;
					case 'l': // lineTo
						x = outline[i++] * scale + offsetX;
						y = outline[i++] * scale + offsetY;
						path.lineTo(x, y);
						break;
					case 'q': // quadraticCurveTo
						cpx = outline[i++] * scale + offsetX;
						cpy = outline[i++] * scale + offsetY;
						cpx1 = outline[i++] * scale + offsetX;
						cpy1 = outline[i++] * scale + offsetY;
						path.quadraticCurveTo(cpx1, cpy1, cpx, cpy);
						break;
					case 'b': // bezierCurveTo
						cpx = outline[i++] * scale + offsetX;
						cpy = outline[i++] * scale + offsetY;
						cpx1 = outline[i++] * scale + offsetX;
						cpy1 = outline[i++] * scale + offsetY;
						cpx2 = outline[i++] * scale + offsetX;
						cpy2 = outline[i++] * scale + offsetY;
						path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, cpx, cpy);
						break;
				}
			}
		}
		return { offsetX: glyph.ha * scale, path: path };
	}
}
