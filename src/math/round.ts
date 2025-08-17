export function smartRound(input: number, precision = 0.001): number {
	let mul = 1;
	for (let i = 0; i < 10; ++i) {
		let r = Math.round(mul * input) / mul;
		if (Math.abs(r - input) < precision) {
			return r;
		}
		mul *= 10;
	}
	return input;
}
