export class ExpressionSample {
	v = 0.0;
	t = 0.0;
	s = 0;
	c = 0;
	selected = false;

	setCurveType(curveType: number): void {
		this.c = curveType;
	}

	/**
	 * toString
	 */
	toString(indent = ''): string {
		return indent + this.t + ' ' + this.v;
	}
}
