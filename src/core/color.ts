export class Color {
	r = 1;
	g = 1;
	b = 1;
	a = 1;

	constructor(r?: number, g?: number, b?: number, a?: number) {
		this.r = r ?? 1;
		this.g = g ?? 1;
		this.b = b ?? 1;
		this.a = a ?? 1;
	}
}
