import { vec3, vec4 } from 'gl-matrix';

export class Color {
	r: number;
	g: number;
	b: number;
	a: number;
	constructor(r = 0, g = 0, b = 0, a = 255) {
		// TODO: move / 255 in caller
		this.r = r / 255.0;
		this.g = g / 255.0;
		this.b = b / 255.0;
		this.a = a / 255.0;
	}

	randomize(color1: Color, color2: Color) {
		const f = Math.random();
		this.r = (color2.r - color1.r) * f + color1.r;
		this.g = (color2.g - color1.g) * f + color1.g;
		this.b = (color2.b - color1.b) * f + color1.b;
	}

	setColor(color: Color) {
		this.r = color.r;
		this.g = color.g;
		this.b = color.b;
		return this;
	}

	setColorAlpha(color: Color) {
		this.r = color.r;
		this.g = color.g;
		this.b = color.b;
		this.a = color.a;
		return this;
	}

	fromVec3(v: vec3) {
		this.r = v[0];
		this.g = v[1];
		this.b = v[2];
		return this;
	}

	fromVec4(v: vec4) {
		this.r = v[0];
		this.g = v[1];
		this.b = v[2];
		this.a = v[3];
		return this;
	}

	getRed() {
		return Math.round(this.r * 255.0);
	}

	getGreen() {
		return Math.round(this.g * 255.0);
	}

	getBlue() {
		return Math.round(this.b * 255.0);
	}

	getAlpha() {
		return Math.round(this.a * 255.0);
	}

	setRed(r: number) {
		this.r = r / 255.0;
	}

	setGreen(g: number) {
		this.g = g / 255.0;
	}

	setBlue(b: number) {
		this.b = b / 255.0;
	}

	toString() {
		return '' + this.getRed() + ' ' + this.getGreen() + ' ' + this.getBlue() + ' ' + this.getAlpha();
	}

	setWhite() {
		this.r = 1.0;
		this.g = 1.0;
		this.b = 1.0;
		this.a = 1.0;
	}

}

export const BLACK = new Color();
export const WHITE = new Color(255, 255, 255, 255);
