import { Font } from '../misc/font';
import { customFetch } from '../utils/customfetch';

export class FontManager {
	static #fontList = new Map<string, Map<string, Font>>();
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
			const response = await customFetch(this.#fontsPath + 'manifest.json');
			resolve(await response.json());
		});
		return this.#manifestPromise;
	}

	static async #loadFont(name: string, style: string) {
		const manifest = await this.#getManifest();

		const fonts = manifest?.fonts;
		if (fonts) {
			const font = fonts[name];
			if (font && font.styles) {
				const s = font.styles[style];
				if (s) {
					const response = await customFetch(this.#fontsPath + s);
					const fontFile = await response.json();
					const font = new Font(fontFile);
					this.#fontList.get(name)!.set(style, font);
					return font;
				}
			}
		}
	}

	static async getFont(name: string, style = 'normal') {
		name = name.toLowerCase();
		style = style.toLowerCase();
		const fontFamilly = this.#fontList.get(name);
		if (fontFamilly) {
			const font = fontFamilly.get(style);
			if (font) {
				return font;
			}
		} else {
			this.#fontList.set(name, new Map());
		}
		return await this.#loadFont(name, style);
	}

	static async getFontList(): Promise<Map<string, Set<string>>> {
		const list = new Map<string, Set<string>>();
		const manifest = await this.#getManifest();

		const fonts = manifest?.fonts;
		if (fonts) {
			for (const fontName in fonts) {
				const font = fonts[fontName];
				const styles = new Set<string>;
				for (const styleName in font.styles) {
					styles.add(styleName);
				}
				list.set(fontName, styles);
			}
		}
		return list;
	}
}
