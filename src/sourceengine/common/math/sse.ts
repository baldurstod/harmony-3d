import { SimpleSpline } from '../../../math/functions';

/**
 * Compute Bias.
 * @param value {Number} Input value.
 * @param bias {Number} Bias.
 * @return {Number} Biased value.
 */
export function Bias(value: number, bias: number): number {
	const exponent = Math.log(bias) * -1.4426950408889634; // 1/log(0.5)
	return Math.pow(value, exponent);
}

export const Four_Zeros = 0;
export const Four_Ones = 1;
export const Four_Twos = 2;
export const Four_PointFives = 0.5;

export function CmpGtSIMD(a: number, b: number): boolean {
	return a > b;
}

export function CmpGeSIMD(a: number, b: number): boolean {
	return a >= b;
}

export function CmpLtSIMD(a: number, b: number): boolean {
	return a < b;
}

export function CmpLeSIMD(a: number, b: number): boolean {
	return a <= b;
}

export function AndSIMD(a: boolean, b: boolean): boolean {
	return a && b;
}

export function OrSIMD(a: boolean, b: boolean): boolean {
	return a || b;
}

export function AndNotSIMD(a: number, b: number) {
	return !a && b;
}

export function MulSIMD(a: number, b: number) {
	return a * b;
}

export function DivSIMD(a: number, b: number) {
	return a / b;
}

export function AddSIMD(a: number, b: number) {
	return a + b;
}

export function SubSIMD(a: number, b: number) {
	return a - b;
}

export function ReciprocalEstSIMD(a: number) {
	return 1 / a;
}

export function ReciprocalSIMD(a: number) {
	return 1 / a;
}

export function IsAnyNegative(a: number) {
	return a != 0;
}

export function MaxSIMD(a: number, b: number) {
	return Math.max(a, b);
}

export function MinSIMD(a: number, b: number) {
	return Math.min(a, b);
}

export function BiasSIMD(val: number, precalc_param: number) {
	// similar to bias function except pass precalced bias value from calling PreCalcBiasParameter.

	// !!speed!! use reciprocal est?
	// !!speed!! could save one op by precalcing _2_ values
	return DivSIMD(val, AddSIMD(MulSIMD(precalc_param, SubSIMD(Four_Ones, val)), Four_Ones));
}

export function MaskedAssign(ReplacementMask: boolean, NewValue: number, OldValue: number) {
	// TODO: params are vec4
	return ReplacementMask ? NewValue : OldValue;
	/*return OrSIMD(
		AndSIMD(ReplacementMask, NewValue),
		AndNotSIMD(ReplacementMask, OldValue));*/
}

export function SinEst01SIMD(val: number) {
	return Math.sin(val * Math.PI);
}



export function SimpleSplineRemapValWithDeltasClamped(val: number, A: number, BMinusA: number, OneOverBMinusA: number, C: number, DMinusC: number) {
	//	if (A == B)
	//		return val >= B ? D : C;
	let cVal = (val - A) * OneOverBMinusA;//fltx4 cVal = MulSIMD(SubSIMD(val, A), OneOverBMinusA);
	cVal = Math.min(Math.max(0.0, cVal), 1.0);//Clamp(cVal, 0.0, 1.0);//cVal = MinSIMD(Four_Ones, MaxSIMD(Four_Zeros, cVal));
	return C + DMinusC * SimpleSpline(cVal);//AddSIMD(C, MulSIMD(DMinusC, SimpleSpline(cVal)));
}
