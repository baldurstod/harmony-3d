import { SimpleSpline } from '../../../math/functions';

/**
 * Compute Bias.
 * @param value {Number} Input value.
 * @param bias {Number} Bias.
 * @return {Number} Biased value.
 */
export function Bias(value, bias) {
	const exponent = Math.log(bias) * -1.4426950408889634; // 1/log(0.5)
	return Math.pow(value,exponent);
}

export const Four_Zeros = 0;
export const Four_Ones = 1;
export const Four_Twos = 2;
export const Four_PointFives = 0.5;

export function CmpGtSIMD(a, b) {
	return a > b ? ~0 : 0;
}

export function CmpGeSIMD(a, b) {
	return a >= b ? ~0 : 0;
}
export function CmpLtSIMD(a, b) {
	return a < b ? ~0 : 0;
}

export function CmpLeSIMD(a, b) {
	return a <= b ? ~0 : 0;
}

export function AndSIMD(a, b) {
	return a & b;
}

export function OrSIMD(a, b) {
	return a | b;
}

export function AndNotSIMD(a, b) {
	return ~a & b;
}

export function MulSIMD(a, b) {
	return a * b;
}

export function DivSIMD(a, b) {
	return a / b;
}

export function AddSIMD(a, b) {
	return a + b;
}

export function SubSIMD(a, b) {
	return a - b;
}

export function ReciprocalEstSIMD(a) {
	return 1 / a;
}

export function ReciprocalSIMD(a) {
	return 1 / a;
}

export function IsAnyNegative(a) {
	return a != 0;
}

export function MaxSIMD(a, b) {
	return Math.max(a, b);
}

export function MinSIMD(a, b) {
	return Math.min(a, b);
}

export function BiasSIMD(val, precalc_param) {
	// similar to bias function except pass precalced bias value from calling PreCalcBiasParameter.

	// !!speed!! use reciprocal est?
	// !!speed!! could save one op by precalcing _2_ values
	return DivSIMD(val, AddSIMD(MulSIMD(precalc_param, SubSIMD(Four_Ones, val)), Four_Ones));
}

export function MaskedAssign(ReplacementMask, NewValue, OldValue) {
	return OrSIMD(
		AndSIMD(ReplacementMask, NewValue),
		AndNotSIMD(ReplacementMask, OldValue));
}

export function SinEst01SIMD(val) {
	return Math.sin(val * Math.PI);
}



export function SimpleSplineRemapValWithDeltasClamped(val, A, BMinusA, OneOverBMinusA, C, DMinusC) {
//	if (A == B)
//		return val >= B ? D : C;
	let cVal = (val - A) * OneOverBMinusA;//fltx4 cVal = MulSIMD(SubSIMD(val, A), OneOverBMinusA);
	cVal = Math.min(Math.max(0.0, cVal), 1.0);//Clamp(cVal, 0.0, 1.0);//cVal = MinSIMD(Four_Ones, MaxSIMD(Four_Zeros, cVal));
	return C + DMinusC * SimpleSpline(cVal);//AddSIMD(C, MulSIMD(DMinusC, SimpleSpline(cVal)));
}
