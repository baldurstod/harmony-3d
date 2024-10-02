import { Font } from '../misc/font';
import { customFetch } from '../utils/customfetch';

export class FontManager {
	static #fontList = new Map();
	static #fontsPath: URL;
	static #manifestPromise?: Promise<any>;

	static setFontsPath(url: URL) {
		this.#fontsPath = url;
	}

	static async #getManifest() {
		if (this.#manifestPromise) {
			return this.#manifestPromise;
		}

		this.#manifestPromise = new Promise(async resolve => {

			if (!this.#fontsPath) {
				throw 'No manifest set';
			}
			let response = await customFetch(this.#fontsPath + 'manifest.json');
			resolve(await response.json());
		});
		return this.#manifestPromise;
	}

	static async #loadFont(name: string, style: string) {
		let manifest = await this.#getManifest();

		let fonts = manifest?.fonts;
		if (fonts) {
			let font = fonts[name];
			if (font && font.styles) {
				let s = font.styles[style];
				if (s) {
					let response = await customFetch(this.#fontsPath + s);
					let fontFile = await response.json();
					let font = new Font(fontFile);
					this.#fontList.get(name).set(style, font);
					return font;
				}
			}
		}
	}

	static async getFont(name: string, style = 'normal') {
		name = name.toLowerCase();
		style = style.toLowerCase();
		let fontFamilly = this.#fontList.get(name);
		if (fontFamilly) {
			let font = fontFamilly.get(style);
			if (font) {
				return font;
			}
		} else {
			this.#fontList.set(name, new Map());
		}
		return await this.#loadFont(name, style);
	}

	static async getFontList() {
		let list: Array<Array<string>> = [];
		let manifest = await this.#getManifest();

		let fonts = manifest?.fonts;
		if (fonts) {
			for (let fontName in fonts) {
				let font = fonts[fontName];
				for (let styleName in font.styles) {
					list.push([fontName, styleName]);
				}
			}
		}
		return list;
	}
}
