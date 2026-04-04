import { vec3, vec4 } from 'gl-matrix';

export class ParticleColor {
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

	randomize(color1: ParticleColor, color2: ParticleColor): void {
		const f = Math.random();
		this.r = (color2.r - color1.r) * f + color1.r;
		this.g = (color2.g - color1.g) * f + color1.g;
		this.b = (color2.b - color1.b) * f + color1.b;
	}

	setColor(color: ParticleColor): void {
		this.r = color.r;
		this.g = color.g;
		this.b = color.b;
	}

	setColorAlpha(color: ParticleColor): void {
		this.r = color.r;
		this.g = color.g;
		this.b = color.b;
		this.a = color.a;
	}

	fromVec3(v: vec3): void {
		this.r = v[0];
		this.g = v[1];
		this.b = v[2];
	}

	fromVec4(v: vec4): void {
		this.r = v[0];
		this.g = v[1];
		this.b = v[2];
		this.a = v[3];
	}

	getRed(): number {
		return Math.round(this.r * 255.0);
	}

	getGreen(): number {
		return Math.round(this.g * 255.0);
	}

	getBlue(): number {
		return Math.round(this.b * 255.0);
	}

	getAlpha(): number {
		return Math.round(this.a * 255.0);
	}

	setRed(r: number): void {
		this.r = r / 255.0;
	}

	setGreen(g: number): void {
		this.g = g / 255.0;
	}

	setBlue(b: number): void {
		this.b = b / 255.0;
	}

	toString(): string {
		return '' + this.getRed() + ' ' + this.getGreen() + ' ' + this.getBlue() + ' ' + this.getAlpha();
	}

	setWhite(): void {
		this.r = 1.0;
		this.g = 1.0;
		this.b = 1.0;
		this.a = 1.0;
	}

}

export const BLACK = new ParticleColor();
export const WHITE = new ParticleColor(255, 255, 255, 255);
