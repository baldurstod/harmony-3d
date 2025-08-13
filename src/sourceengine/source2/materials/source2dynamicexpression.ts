import { vec4 } from 'gl-matrix';
import { murmurhash2_32_gc } from 'murmurhash';
import { WARN } from '../../../buildoptions';
import { clamp, pow2 } from '../../../math/functions';

/**
 * DynamicExpression
 */
let stack: vec4[];
const HASH_SEED = 0x31415926;
const hashes = new Map<number, string>();
hashes.set(murmurhash2_32_gc('time', HASH_SEED), 'time');

function getAttribute(hash: number, renderAttributes: string[]): string | undefined {
	let stringValue = hashes.get(hash);
	if (!stringValue) {
		for (let renderAttribute of renderAttributes) {
			renderAttribute = renderAttribute.toLowerCase();
			hashes.set(murmurhash2_32_gc(renderAttribute, HASH_SEED), renderAttribute);
		}
		stringValue = hashes.get(hash);
	}

	return stringValue;
}

export function executeDynamicExpression(byteCode: Uint8Array, renderAttributes: string[]): vec4 | undefined {
	let pointer = -1;
	const storage = new Map<number, vec4>();
	stack = [];

	let storeAddress;
	let location;
	while (pointer < byteCode.length) {
		++pointer;
		const opcode = byteCode[pointer];
		switch (opcode) {
			case 0: // stop
				return stack.pop();
				break;
			case 2: // goto
				location = getlocation(byteCode, pointer + 1);
				if ((location >= 0) && (location < byteCode.length)) {
					pointer = location - 1;
				} else {
					//TODO: error message
					return;
				}
				break;
			case 4: // ?
				const conditionalValue = stack.pop()!;
				// Only the first value is tested
				location = conditionalValue[0] ? getlocation(byteCode, pointer + 1) : getlocation(byteCode, pointer + 3);
				if ((location >= 0) && (location < byteCode.length)) {
					pointer = location - 1;
				} else {
					//TODO: error message
					return;
				}
				break;
			case 6: // function
				const functionCode = getlocation(byteCode, pointer + 1);
				if (functionCode >= 0) {
					processFunction(functionCode);
					pointer += 2;
				} else {
					//TODO: error message
					return;
				}
				break;
			case 7: // float32
				stack.push(getFloat32(byteCode, pointer + 1));
				pointer += 4;
				break;
			case 8: // save
				storeAddress = getByte(byteCode, pointer + 1);
				if (storeAddress >= 0) {
					storage.set(storeAddress, stack.pop()!);
					pointer += 1;
				} else {
					//TODO: error message
					return;
				}
				break;
			case 9: // restore
				storeAddress = getByte(byteCode, pointer + 1);
				if (storeAddress >= 0) {
					stack.push(storage.get(storeAddress)!);
					pointer += 1;
				} else {
					//TODO: error message
					return;
				}
				break;
			case 12:
				not();
				break;
			case 13: // ==
				equality();
				break;
			case 14: // !=
				inequality();
				break;
			case 15: // >
				greater();
				break;
			case 16: // >=
				greaterEqual();
				break;
			case 17: // <
				less();
				break;
			case 18: // <=
				lessEqual();
				break;
			case 19: // +
				add();
				break;
			case 20: // -
				subtract();
				break;
			case 21: // *
				multiply();
				break;
			case 22: // /
				divide();
				break;
			case 23: // %
				modulo();
				break;
			case 24: // negate
				negation()
				break;
			case 25: // get value
				const hash = (byteCode[pointer + 1]! + (byteCode[pointer + 2]! << 8) + (byteCode[pointer + 3]! << 16) + (byteCode[pointer + 4]! << 24)) >>> 0;
				let stringValue = getAttribute(hash, renderAttributes);

				if (stringValue) {
					let value = 0;
					if (stringValue === 'time') {
						value = performance.now() * 0.001;
					} else {
						//console.log(stringValue);
						//TODO get an external var
					}
					stack.push(vec4.fromValues(value, value, value, value));
				}
				pointer += 4;
				break;
			//see m_renderAttributesUsed
			//time : 0: 25 1: 204 2: 133 3: 68 4: 150 5: 0
			//$gemcolor: 0: 25 1: 230 2: 22 3: 70 4: 81 5: 0
			//a: 0: 25 1: 225 2: 113 3: 207 4: 30 5: 0
			//b: 0: 25 1: 42 2: 183 3: 253 4: 183 5: 0
			//B: 0: 25 1: 42 2: 183 3: 253 4: 183 5: 0
			//$a: 0: 25 1: 96 2: 46 3: 222 4: 5 5: 0
			//??? 0: 25 1: 252 2: 99 3: 114 4: 40 5: 0 ==> $PA_ARCANA_DETAIL1SCALE
			//$gem 0: 25 1: 150 2: 173 3: 217 4: 104 5: 0
			case 30:
				swizzle(getByte(byteCode, ++pointer));
				break;
			case 31: // exist
				stack.push(vec4.fromValues(0, 0, 0, 0));//TODO get an external var
				pointer += 4;
				break;
			default:
				if (WARN) {
					console.warn('Unknown opcode ', opcode, ' at location ', pointer);
				}
				break;
		}
	}
}

function processFunction(functionCode: number): void {
	let a: vec4, b: vec4, c: vec4, d;
	switch (functionCode) {
		case 0: // sin
			sin();
			break;
		case 1: // cos
			cos();
			break;
		case 2: // tan
			tan();
			break;
		case 3: // frac
			frac();
			break;
		case 4: // floor
			floor();
			break;
		case 5: // ceil
			ceil();
			break;
		case 6: // saturate
			saturate();
			break;
		case 7: // clamp
			a = stack.pop()!;
			b = stack.pop()!;
			c = stack.pop()!;
			a[0] = clamp(c[0], b[0], a[0]);
			a[1] = clamp(c[1], b[1], a[1]);
			a[2] = clamp(c[2], b[2], a[2]);
			a[3] = clamp(c[3], b[3], a[3]);
			stack.push(a);
			break;
		case 8: // lerp
			const factor = stack.pop()!;
			const second = stack.pop()!;
			const first = stack.pop()!;
			first[0] = first[0] + factor[0] * (second[0] - first[0]);
			first[1] = first[1] + factor[1] * (second[1] - first[1]);
			first[2] = first[2] + factor[2] * (second[2] - first[2]);
			first[3] = first[3] + factor[3] * (second[3] - first[3]);
			stack.push(first);
			break;
		case 9: // dot4
			dot4();
			break;
		case 10: // dot3
			dot3();
			break;
		case 11: // dot2
			dot2();
			break;
		case 12: // log
			log();
			break;
		case 13: // log2
			log2();
			break;
		case 14: // log10
			log10();
			break;
		case 15: // exp
			exp();
			break;
		case 16: // exp2
			exp2();
			break;
		case 17: // sqrt
			sqrt();
			break;
		case 18: // rsqrt
			rsqrt();
			break;
		case 19: // sign
			sign();
			break;
		case 20: // abs
			abs();
			break;
		case 21: // pow
			pow();
			break;
		case 22: // step
			step();
			break;
		case 23: // smoothstep
			smoothstep();
			break;
		case 24: // float4
			a = stack.pop()!;
			b = stack.pop()!;
			c = stack.pop()!;
			d = stack.pop()!;
			stack.push(vec4.fromValues(d[0], c[0], b[0], a[0]));
			break;
		case 25: // float3
			a = stack.pop()!;
			b = stack.pop()!;
			c = stack.pop()!;
			stack.push(vec4.fromValues(c[0], b[0], a[0], a[0]));
			break;
		case 26: // float2
			a = stack.pop()!;
			b = stack.pop()!;
			stack.push(vec4.fromValues(b[0], a[0], a[0], a[0]));
			break;
		case 27: // time
			const time = performance.now() * 0.001;
			stack.push(vec4.fromValues(time, time, time, time));
			break;
		case 28: // min
			min();
			break;
		case 29: // max
			max();
			break;
		case 30:
			SrgbLinearToGamma();
			break;
		case 31:
			SrgbGammaToLinear();
			break;
		case 32: // random
			random();
			break;
		case 33:
			normalize();
			break;
		case 34:
			length();
			break;
		case 35:
			sqr();
			break;
		case 36:
			//TextureSize();TODO
			break;
		default:
			if (WARN) {
				console.warn('Unknown function code ', functionCode);
			}
			break;
	}
}

function getByte(b: Uint8Array, offset: number): number {
	return (offset > b.length - 1) ? -1 : b[0 + offset]!;
}

function getFloat32(b: Uint8Array, offset: number) {//TODO: optimize
	const sign = 1 - (2 * (b[3 + offset]! >> 7)),
		exponent = (((b[3 + offset]! << 1) & 0xff) | (b[2 + offset]! >> 7)) - 127,
		mantissa = ((b[2 + offset]! & 0x7f) << 16) | (b[1 + offset]! << 8) | b[0 + offset]!;
	let ret;

	if (exponent === 128) {
		if (mantissa !== 0) {
			ret = NaN;
		} else {
			ret = sign * Infinity;
		}
	} else if (exponent === -127) { // Denormalized
		ret = sign * mantissa * pow2(-126 - 23);
	} else {
		ret = sign * (1 + mantissa * pow2(-23)) * pow2(exponent);
	}
	return vec4.fromValues(ret, ret, ret, ret);
}

function getlocation(b: Uint8Array, offset: number) {
	return (offset > b.length - 2) ? -1 : (b[1 + offset]! << 8) | b[0 + offset]!;
}

/*
function _saturate(value) {
	return Math.min(Math.max(value, 0), 1);
}
*/

function getRandomArbitrary(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

function not() {
	const a = stack.pop()!;
	a[0] = Number(!a[0]);
	a[1] = Number(!a[1]);
	a[2] = Number(!a[2]);
	a[3] = Number(!a[3]);
	stack.push(a);
}

function equality() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = Number(b[0] == a[0]);
	a[1] = Number(b[1] == a[1]);
	a[2] = Number(b[2] == a[2]);
	a[3] = Number(b[3] == a[3]);
	stack.push(a);
}

function inequality() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = Number(b[0] != a[0]);
	a[1] = Number(b[1] != a[1]);
	a[2] = Number(b[2] != a[2]);
	a[3] = Number(b[3] != a[3]);
	stack.push(a);
}

function greater() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = Number(b[0] > a[0]);
	a[1] = Number(b[1] > a[1]);
	a[2] = Number(b[2] > a[2]);
	a[3] = Number(b[3] > a[3]);
	stack.push(a);
}

function greaterEqual() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = Number(b[0] >= a[0]);
	a[1] = Number(b[1] >= a[1]);
	a[2] = Number(b[2] >= a[2]);
	a[3] = Number(b[3] >= a[3]);
	stack.push(a);
}

function less() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = Number(b[0] < a[0]);
	a[1] = Number(b[1] < a[1]);
	a[2] = Number(b[2] < a[2]);
	a[3] = Number(b[3] < a[3]);
	stack.push(a);
}

function lessEqual() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = Number(b[0] <= a[0]);
	a[1] = Number(b[1] <= a[1]);
	a[2] = Number(b[2] <= a[2]);
	a[3] = Number(b[3] <= a[3]);
	stack.push(a);
}

function add() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = b[0] + a[0];
	a[1] = b[1] + a[1];
	a[2] = b[2] + a[2];
	a[3] = b[3] + a[3];
	stack.push(a);
}

function subtract() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = b[0] - a[0];
	a[1] = b[1] - a[1];
	a[2] = b[2] - a[2];
	a[3] = b[3] - a[3];
	stack.push(a);
}

function multiply() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = b[0] * a[0];
	a[1] = b[1] * a[1];
	a[2] = b[2] * a[2];
	a[3] = b[3] * a[3];
	stack.push(a);
}

function divide() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = b[0] / a[0];
	a[1] = b[1] / a[1];
	a[2] = b[2] / a[2];
	a[3] = b[3] / a[3];
	stack.push(a);
}

function modulo() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = b[0] % a[0];
	a[1] = b[1] % a[1];
	a[2] = b[2] % a[2];
	a[3] = b[3] % a[3];
	stack.push(a);
}

function negation() {
	const a = stack.pop()!;
	a[0] = -a[0];
	a[1] = -a[1];
	a[2] = -a[2];
	a[3] = -a[3];
	stack.push(a);
}

function swizzle(code: number) {
	const a = stack.pop()!;
	a[0] = a[(code >> 0) & 3]!;
	a[1] = a[(code >> 2) & 3]!;
	a[2] = a[(code >> 4) & 3]!;
	a[3] = a[(code >> 6) & 3]!;
	stack.push(a);
}

// Functions

function sin() {
	const a = stack.pop()!;
	a[0] = Math.sin(a[0]);
	a[1] = Math.sin(a[1]);
	a[2] = Math.sin(a[2]);
	a[3] = Math.sin(a[3]);
	stack.push(a);
}

function cos() {
	const a = stack.pop()!;
	a[0] = Math.cos(a[0]);
	a[1] = Math.cos(a[1]);
	a[2] = Math.cos(a[2]);
	a[3] = Math.cos(a[3]);
	stack.push(a);
}

function tan() {
	const a = stack.pop()!;
	a[0] = Math.tan(a[0]);
	a[1] = Math.tan(a[1]);
	a[2] = Math.tan(a[2]);
	a[3] = Math.tan(a[3]);
	stack.push(a);
}

function frac() {
	const a = stack.pop()!;
	a[0] = a[0] % 1;
	a[1] = a[1] % 1;
	a[2] = a[2] % 1;
	a[3] = a[3] % 1;
	stack.push(a);
}

function floor() {
	const a = stack.pop()!;
	a[0] = Math.floor(a[0]);
	a[1] = Math.floor(a[1]);
	a[2] = Math.floor(a[2]);
	a[3] = Math.floor(a[3]);
	stack.push(a);
}

function ceil() {
	const a = stack.pop()!;
	a[0] = Math.ceil(a[0]);
	a[1] = Math.ceil(a[1]);
	a[2] = Math.ceil(a[2]);
	a[3] = Math.ceil(a[3]);
	stack.push(a);
}

function saturate() {
	const a = stack.pop()!;
	a[0] = clamp(a[0], 0, 1);
	a[1] = clamp(a[1], 0, 1);
	a[2] = clamp(a[2], 0, 1);
	a[3] = clamp(a[3], 0, 1);
	stack.push(a);
}

function dot4() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = a[1] = a[2] = a[3] = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
	stack.push(a);
}

function dot3() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = a[1] = a[2] = a[3] = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	stack.push(a);
}

function dot2() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = a[1] = a[2] = a[3] = a[0] * b[0] + a[1] * b[1];
	stack.push(a);
}

function log() {
	const a = stack.pop()!;
	a[0] = Math.log(a[0]);
	a[1] = Math.log(a[1]);
	a[2] = Math.log(a[2]);
	a[3] = Math.log(a[3]);
	stack.push(a);
}

function log2() {
	const a = stack.pop()!;
	a[0] = Math.log2(a[0]);
	a[1] = Math.log2(a[1]);
	a[2] = Math.log2(a[2]);
	a[3] = Math.log2(a[3]);
	stack.push(a);
}

function log10() {
	const a = stack.pop()!;
	a[0] = Math.log10(a[0]);
	a[1] = Math.log10(a[1]);
	a[2] = Math.log10(a[2]);
	a[3] = Math.log10(a[3]);
	stack.push(a);
}

function exp() {
	const a = stack.pop()!;
	a[0] = Math.exp(a[0]);
	a[1] = Math.exp(a[1]);
	a[2] = Math.exp(a[2]);
	a[3] = Math.exp(a[3]);
	stack.push(a);
}

function exp2() {
	const a = stack.pop()!;
	a[0] = 2 ** a[0];
	a[1] = 2 ** a[1];
	a[2] = 2 ** a[2];
	a[3] = 2 ** a[3];
	stack.push(a);
}

function sqrt() {
	const a = stack.pop()!;
	a[0] = Math.sqrt(a[0]);
	a[1] = Math.sqrt(a[1]);
	a[2] = Math.sqrt(a[2]);
	a[3] = Math.sqrt(a[3]);
	stack.push(a);
}

function rsqrt() {
	const a = stack.pop()!;
	a[0] = 1 / Math.sqrt(a[0]);
	a[1] = 1 / Math.sqrt(a[1]);
	a[2] = 1 / Math.sqrt(a[2]);
	a[3] = 1 / Math.sqrt(a[3]);
	stack.push(a);
}

function sign() {
	const a = stack.pop()!;
	a[0] = Math.sign(a[0]);
	a[1] = Math.sign(a[1]);
	a[2] = Math.sign(a[2]);
	a[3] = Math.sign(a[3]);
	stack.push(a);
}

function abs() {
	const a = stack.pop()!;
	a[0] = Math.abs(a[0]);
	a[1] = Math.abs(a[1]);
	a[2] = Math.abs(a[2]);
	a[3] = Math.abs(a[3]);
	stack.push(a);
}

function pow() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = b[0] ** a[0];
	a[1] = b[1] ** a[1];
	a[2] = b[2] ** a[2];
	a[3] = b[3] ** a[3];
	stack.push(a);
}

function step() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = b[0] >= a[0] ? 1 : 0;
	a[1] = b[1] >= a[1] ? 1 : 0;
	a[2] = b[2] >= a[2] ? 1 : 0;
	a[3] = b[3] >= a[3] ? 1 : 0;
	stack.push(a);
}

function _smoothstep(min: number, max: number, x: number) {
	x = clamp((x - min) / (max - min), 0.0, 1.0);
	return x * x * (3 - 2 * x);
}

function smoothstep() {
	const x = stack.pop()!;
	const max = stack.pop()!;
	const min = stack.pop()!;
	x[0] = _smoothstep(min[0], max[0], x[0]);
	x[1] = _smoothstep(min[1], max[1], x[1]);
	x[2] = _smoothstep(min[2], max[2], x[2]);
	x[3] = _smoothstep(min[3], max[3], x[3]);
	stack.push(x);
}

function min() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = Math.min(b[0], a[0]);
	a[1] = Math.min(b[1], a[1]);
	a[2] = Math.min(b[2], a[2]);
	a[3] = Math.min(b[3], a[3]);
	stack.push(a);
}

function max() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = Math.max(b[0], a[0]);
	a[1] = Math.max(b[1], a[1]);
	a[2] = Math.max(b[2], a[2]);
	a[3] = Math.max(b[3], a[3]);
	stack.push(a);
}

function SrgbLinearToGamma() {
	const a = stack.pop()!;
	//saturate
	a[0] = Math.min(Math.max(a[0], 0), 1);
	a[1] = Math.min(Math.max(a[1], 0), 1);
	a[2] = Math.min(Math.max(a[2], 0), 1);
	a[3] = Math.min(Math.max(a[3], 0), 1);

	a[0] = (a[0] <= 0.0031308) ? (a[0] * 12.92) : (1.055 * Math.pow(a[0], (1.0 / 2.4))) - 0.055;
	a[1] = (a[1] <= 0.0031308) ? (a[1] * 12.92) : (1.055 * Math.pow(a[1], (1.0 / 2.4))) - 0.055;
	a[2] = (a[2] <= 0.0031308) ? (a[2] * 12.92) : (1.055 * Math.pow(a[2], (1.0 / 2.4))) - 0.055;
	a[3] = (a[3] <= 0.0031308) ? (a[3] * 12.92) : (1.055 * Math.pow(a[3], (1.0 / 2.4))) - 0.055;

	stack.push(a);
}

function SrgbGammaToLinear() {
	const a = stack.pop()!;
	//saturate
	a[0] = Math.min(Math.max(a[0], 0), 1);
	a[1] = Math.min(Math.max(a[1], 0), 1);
	a[2] = Math.min(Math.max(a[2], 0), 1);
	a[3] = Math.min(Math.max(a[3], 0), 1);

	a[0] = (a[0] <= 0.04045) ? (a[0] / 12.92) : (Math.pow((a[0] + 0.055) / 1.055, 2.4));
	a[1] = (a[1] <= 0.04045) ? (a[1] / 12.92) : (Math.pow((a[1] + 0.055) / 1.055, 2.4));
	a[2] = (a[2] <= 0.04045) ? (a[2] / 12.92) : (Math.pow((a[2] + 0.055) / 1.055, 2.4));
	a[3] = (a[3] <= 0.04045) ? (a[3] / 12.92) : (Math.pow((a[3] + 0.055) / 1.055, 2.4));

	stack.push(a);
}

function random() {
	const a = stack.pop()!;
	const b = stack.pop()!;
	a[0] = getRandomArbitrary(b[0], a[0]);
	a[1] = getRandomArbitrary(b[1], a[1]);
	a[2] = getRandomArbitrary(b[2], a[2]);
	a[3] = getRandomArbitrary(b[3], a[3]);
	stack.push(a);
}

function normalize() {
	const a = stack.pop()!;
	vec4.normalize(a, a);
	stack.push(a);
}

function length() {
	const a = stack.pop()!;
	a[0] = a[1] = a[2] = a[3] = Math.hypot(a[0], a[1], a[2]);
	stack.push(a);
}

function sqr() {
	const a = stack.pop()!;
	a[0] = a[0] * a[0];
	a[1] = a[1] * a[1];
	a[2] = a[2] * a[2];
	a[3] = a[3] * a[3];
	stack.push(a);
}

enum FunctionCode {
	Sin = 0,
	Cos = 1,
	Tan = 2,
	Frac = 3,
	Floor = 4,
	Ceil = 5,
	Saturate = 6,
	Clamp = 7,
	Lerp = 8,
	Dot4 = 9,
	Dot3 = 10,
	Dot2 = 11,
	Log = 12,
	Log2 = 13,
	Log10 = 14,
	Exp = 15,
	Exp2 = 16,
	Sqrt = 17,
	Rsqrt = 18,
	Sign = 19,
	Abs = 20,
	Pow = 21,
	Step = 22,
	Smoothstep = 23,
	Float4 = 24,
	Float3 = 25,
	Float2 = 26,
	Time = 27,
	Min = 28,
	Max = 29,
	SrgbLinearToGamma = 30,
	SrgbGammaToLinear = 31,
	Random = 32,
	Normalize = 33,
	Length = 34,
	Sqr = 35,
	TextureSize = 36,
}

enum OpCode {
	Return = 0,
	Goto = 2,
	Ternary = 4,
	Function = 6,
	Float32 = 7,
	Addition = 19,
	Subtraction = 20,
	Multiplication = 21,
	Division = 22,
	Negation = 24,
	AttributeLiteral = 25,
	Exists = 31,
}

type Operand = string | number | Operation;

type Operation = {
	operator: OpCode;
	function?: FunctionCode;
	operand1?: Operand;
	operand2?: Operand;
	operand3?: Operand;
	operand4?: Operand;
}

const done = new Map<string, boolean>();

export function decompileDynamicExpression(dynamicName: string, byteCode: Uint8Array, renderAttributes: string[]): string | null {
	const operand = toOperation(byteCode, renderAttributes);

	if (operand) {
		//console.error(dynamicName, );
		return operandToString(operand)?.[0] ?? null;
	}
	return null
}

function toOperation(byteCode: Uint8Array, renderAttributes: string[], startPointer = 0): Operand | null {
	let pointer = startPointer - 1;
	const storage = new Map<number, vec4>();
	//stack = [];

	const operandStack: Operand[] = [];
	//const operationStack: Operation[] = [];

	let storeAddress;
	let location;
	while (pointer < byteCode.length) {
		++pointer;
		const opcode = byteCode[pointer];
		switch (opcode) {
			case OpCode.Return:
				return operandStack.pop() ?? null;
			case OpCode.Goto:
				operandStack.push({ operator: opcode, operand1: getlocation(byteCode, pointer + 1) });
				break;
			case OpCode.Ternary:
				const conditionalValue = operandStack.pop()!;
				const branch1 = toOperation(byteCode, renderAttributes, getlocation(byteCode, pointer + 1));
				const branch2 = toOperation(byteCode, renderAttributes, getlocation(byteCode, pointer + 2));

				if (branch1 && branch2) {
					operandStack.push({ operator: opcode, operand1: conditionalValue, operand2: branch1, operand3: branch2 });
				} else {
					console.error('missing branch at', pointer, byteCode);
				}
				pointer = Infinity;// Stop
				break;
			/*
	case 4: // ?
		const conditionalValue = stack.pop()!;
		// Only the first value is tested
		location = conditionalValue[0] ? getlocation(byteCode, pointer + 1) : getlocation(byteCode, pointer + 3);
		if ((location >= 0) && (location < byteCode.length)) {
			pointer = location - 1;
		} else {
			//TODO: error message
			return;
		}
		break;
		*/
			case OpCode.Function:
				const operand = functionToOperation(getlocation(byteCode, pointer + 1), operandStack);
				if (operand) {
					operandStack.push(operand);
				}
				pointer += 2;
				break;
			case OpCode.Float32:
				operandStack.push(getFloat32(byteCode, pointer + 1)[0]);// getFloat32 returns a vec4, but we only need a scalar
				pointer += 4;
				break;
			/*
		case 8: // save
			storeAddress = getByte(byteCode, pointer + 1);
			if (storeAddress >= 0) {
				storage.set(storeAddress, stack.pop()!);
				pointer += 1;
			} else {
				//TODO: error message
				return;
			}
			break;
		case 9: // restore
			storeAddress = getByte(byteCode, pointer + 1);
			if (storeAddress >= 0) {
				stack.push(storage.get(storeAddress)!);
				pointer += 1;
			} else {
				//TODO: error message
				return;
			}
			break;
		case 12:
			not();
			break;
		case 13: // ==
			equality();
			break;
		case 14: // !=
			inequality();
			break;
		case 15: // >
			greater();
			break;
		case 16: // >=
			greaterEqual();
			break;
		case 17: // <
			less();
			break;
		case 18: // <=
			lessEqual();
			break;
		case 19: // +
			add();
			break;
		case 20: // -
			subtract();
			break;
			*/
			case OpCode.Addition:
				operandStack.push({ operator: opcode, operand2: operandStack.pop(), operand1: operandStack.pop() });
				break;
			case OpCode.Subtraction:
				operandStack.push({ operator: opcode, operand2: operandStack.pop(), operand1: operandStack.pop() });
				break;
			case OpCode.Multiplication:
				operandStack.push({ operator: opcode, operand2: operandStack.pop(), operand1: operandStack.pop() });
				break;
			case OpCode.Division:
				operandStack.push({ operator: opcode, operand2: operandStack.pop(), operand1: operandStack.pop() });
				break;
			/*
						case 23: // %
							modulo();
							break;
							*/

			case OpCode.Negation:
				operandStack.push({ operator: opcode, operand1: operandStack.pop() });
				break;
			case OpCode.AttributeLiteral:
			case OpCode.Exists:
				const hash = (byteCode[pointer + 1]! + (byteCode[pointer + 2]! << 8) + (byteCode[pointer + 3]! << 16) + (byteCode[pointer + 4]! << 24)) >>> 0;
				pointer += 4;
				let stringValue = getAttribute(hash, renderAttributes);
				operandStack.push({ operator: opcode, operand1: stringValue });
				break;
			/*
			case 25: // get value
				const intValue = (byteCode[pointer + 1]! + (byteCode[pointer + 2]! << 8) + (byteCode[pointer + 3]! << 16) + (byteCode[pointer + 4]! << 24)) >>> 0;
				let stringValue = hashes.get(intValue);
				if (!stringValue) {
					for (let renderAttribute of renderAttributes) {
						renderAttribute = renderAttribute.toLowerCase();
						hashes.set(murmurhash2_32_gc(renderAttribute, HASH_SEED), renderAttribute);
					}
					stringValue = hashes.get(intValue);
				}

				if (stringValue) {
					let value = 0;
					if (stringValue === 'time') {
						value = performance.now() * 0.001;
					} else {
						//console.log(stringValue);
						//TODO get an external var
					}
					stack.push(vec4.fromValues(value, value, value, value));
				}
				pointer += 4;
				break;
			//see m_renderAttributesUsed
			//time : 0: 25 1: 204 2: 133 3: 68 4: 150 5: 0
			//$gemcolor: 0: 25 1: 230 2: 22 3: 70 4: 81 5: 0
			//a: 0: 25 1: 225 2: 113 3: 207 4: 30 5: 0
			//b: 0: 25 1: 42 2: 183 3: 253 4: 183 5: 0
			//B: 0: 25 1: 42 2: 183 3: 253 4: 183 5: 0
			//$a: 0: 25 1: 96 2: 46 3: 222 4: 5 5: 0
			//??? 0: 25 1: 252 2: 99 3: 114 4: 40 5: 0 ==> $PA_ARCANA_DETAIL1SCALE
			//$gem 0: 25 1: 150 2: 173 3: 217 4: 104 5: 0
			case 30:
				swizzle(getByte(byteCode, ++pointer));
				break;
			case 31: // exist
				stack.push(vec4.fromValues(0, 0, 0, 0));//TODO get an external var
				pointer += 4;
				break;
			*/
			default:
				console.error('Unknown opcode ', opcode, ' at location ', pointer);
				break;

		}
	}
	return null;
}

function functionToOperation(functionCode: number, operandStack: Operand[]): Operand | null {
	let a: vec4, b: vec4, c: vec4, d;
	switch (functionCode) {
		// No parameters
		case FunctionCode.Time:
			operandStack.push({ operator: OpCode.Function, function: functionCode });
			break;
		// 1 parameters
		case FunctionCode.Frac:
		case FunctionCode.Sin:
		case FunctionCode.Cos:
		case FunctionCode.Tan:
		case FunctionCode.Floor:
		case FunctionCode.Ceil:
		case FunctionCode.Saturate:
		case FunctionCode.Abs:
			operandStack.push({ operator: OpCode.Function, function: functionCode, operand1: operandStack.pop() });
			break;
		// 2 parameters
		case FunctionCode.Float2:
		case FunctionCode.Random:
			operandStack.push({ operator: OpCode.Function, function: functionCode, operand2: operandStack.pop(), operand1: operandStack.pop() });
			break;
		// 3 parameters
		case FunctionCode.Clamp:
		case FunctionCode.Float3:
		case FunctionCode.Lerp:
			operandStack.push({ operator: OpCode.Function, function: functionCode, operand3: operandStack.pop(), operand2: operandStack.pop(), operand1: operandStack.pop() });
			break;
		// 4 parameters
		case FunctionCode.Float4:
			operandStack.push({ operator: OpCode.Function, function: functionCode, operand4: operandStack.pop(), operand3: operandStack.pop(), operand2: operandStack.pop(), operand1: operandStack.pop() });
			break;
		case FunctionCode.Dot4:
			dot4();
			break;
		case FunctionCode.Dot3:
			dot3();
			break;
		case FunctionCode.Dot2:
			dot2();
			break;
		case FunctionCode.Log:
			log();
			break;
		case FunctionCode.Log2:
			log2();
			break;
		case FunctionCode.Log10:
			log10();
			break;
		case FunctionCode.Exp:
			exp();
			break;
		case FunctionCode.Exp2:
			exp2();
			break;
		case FunctionCode.Sqrt:
			sqrt();
			break;
		case FunctionCode.Rsqrt:
			rsqrt();
			break;
		case FunctionCode.Sign:
			sign();
			break;

		case FunctionCode.Pow:
			pow();
			break;
		case FunctionCode.Step:
			step();
			break;
		case FunctionCode.Smoothstep:
			smoothstep();
			break;
		case FunctionCode.Float4:
			a = stack.pop()!;
			b = stack.pop()!;
			c = stack.pop()!;
			d = stack.pop()!;
			stack.push(vec4.fromValues(d[0], c[0], b[0], a[0]));
			break;


		case FunctionCode.Min:
			min();
			break;
		case FunctionCode.Max:
			max();
			break;
		case FunctionCode.SrgbLinearToGamma:
			SrgbLinearToGamma();
			break;
		case FunctionCode.SrgbGammaToLinear:
			SrgbGammaToLinear();
			break;

		case FunctionCode.Normalize:
			normalize();
			break;
		case FunctionCode.Length:
			length();
			break;
		case FunctionCode.Sqr:
			sqr();
			break;
		case FunctionCode.TextureSize:
			//TextureSize();TODO
			break;
		default:
			if (WARN) {
				console.warn('Unknown function code ', functionCode);
			}
			break;
	}
	return null;
}

enum Precedence {
	Lowest = 0,
	Additive = Lowest + 1,
	Multiplicative = Additive + 1,
	Function = Multiplicative + 1,
	Literal = Function + 1,
}

type Ope = {
	operator: string;
	precedence: Precedence;
	operands: 1 | 2 | 3;
}

const operations = new Map<OpCode, Ope>();
operations.set(OpCode.Addition, { operator: '+', precedence: Precedence.Additive, operands: 2 });
operations.set(OpCode.Subtraction, { operator: '-', precedence: Precedence.Additive, operands: 2 });
operations.set(OpCode.Multiplication, { operator: '*', precedence: Precedence.Additive, operands: 2 });
operations.set(OpCode.Division, { operator: '/', precedence: Precedence.Additive, operands: 2 });
operations.set(OpCode.AttributeLiteral, { operator: '', precedence: Precedence.Literal, operands: 1 });
operations.set(OpCode.Negation, { operator: '-', precedence: Precedence.Literal, operands: 1 });
operations.set(OpCode.Exists, { operator: '', precedence: Precedence.Function, operands: 1 });

function operandToString(operand: Operand): [string, Precedence] | null {
	if (typeof operand == 'number') {
		return [String(operand), Precedence.Literal];
	}

	if (typeof operand == 'string') {
		return [operand, Precedence.Literal];
	}

	if (operand.operator == OpCode.Function) {
		return [functionToString(operand), Precedence.Function];
	}

	const ope = operations.get(operand.operator);
	if (!ope) {
		console.error('Unknown operator ', operand.operator);
		return null;
	}

	const opes: string[] = [];
	const operands: ([string, Precedence])[] = [];

	for (let i = 0; i < ope.operands; i++) {
		let operandN;
		switch (i) {// TODO: improve that code
			case 0:
				operandN = operand.operand1;
				break;
			case 1:
				operandN = operand.operand2;
				break;
			case 2:
				operandN = operand.operand3;
				break;
			case 3:
				operandN = operand.operand4;
				break;
		}
		if (operandN !== undefined) {
			const o = operandToString(operandN);
			if (o) {
				operands.push(o);
				let oo = o?.[0];
				if (o?.[1] < ope.precedence) {
					oo = `(${oo})`;
				}
				opes.push(oo);
			} else {
				console.error('no operand ' + i, operand);
			}
		} else {
			console.error('missing an operand ' + i, operand);
		}
	}
	/*
		let operand1: [string, Precedence] | null = null;
		let operand2: [string, Precedence] | null = null;
		if (operand.operand1) {
			operand1 = operandToString(operand.operand1);
		}
		if (operand.operand2) {
			operand2 = operandToString(operand.operand2);
		}

		if (!operand1 || !operand2) {
			console.error('no operand', operand, operand1, operand2);
			return null;
		}
			* ,/

	let ope1 = operand1?.[0];
	let ope2 = operand2?.[0];

	if (operand1?.[1] < ope.precedence) {
		ope1 = `(${ope1})`;
	}

	if (operand2?.[1] < ope.precedence) {
		ope2 = `(${ope2})`;
	}
	*/

	if (operand.operator == OpCode.Exists) {
		return [`exists(${ope.operator}${opes[0]})`, ope.precedence];
	}

	switch (ope.operands) {
		case 1:
			return [`${ope.operator}${opes[0]}`, ope.precedence];
		case 2:
			return [`${opes[0]} ${ope.operator} ${opes[1]}`, ope.precedence];
		case 3:
			return [`${opes[0]} ${ope.operator} ${opes[1]}`, ope.precedence];
	}

	//return [`${ope1} ${ope.operator} ${ope2}`, ope.precedence];

	/*
		switch (operand.operator) {
			case Operator.Addition:
			/*

		//return `(${operandToString(operand.operand1!)} + ${operandToString(operand.operand2!)})`;
		case Operator.Subtraction:
			return `(${operandToString(operand.operand1!)} - ${operandToString(operand.operand2!)})`;
		case Operator.Multiplication:
			return `(${operandToString(operand.operand1!)} * ${operandToString(operand.operand2!)})`;
		case Operator.Division:
			return `(${operandToString(operand.operand1!)} / ${operandToString(operand.operand2!)})`;
		case Operator.Function:


		/*

			Addition,
			Subtraction,
			Multiplication,
			Division,
			Function,
			* /

			default:
				console.error('Unknown operator ', operand.operator);
				break;
		}
		return null;
		*/
}

function functionToString(operand: Operation): string {
	let operand1;
	let operand2;
	let operand3;

	if (operand.operand1 !== undefined) {
		operand1 = operandToString(operand.operand1)?.[0];
	}
	if (operand.operand2 !== undefined) {
		operand2 = operandToString(operand.operand2)?.[0];
	}
	if (operand.operand3 !== undefined) {
		operand3 = operandToString(operand.operand3)?.[0];
	}

	switch (operand.function!) {
		case FunctionCode.Frac:
			if (operand1) {
				return `frac( ${operand1} )`;
			}
			break;
		case FunctionCode.Lerp:
			if (operand1 && operand2 && operand3) {
				return `lerp( ${operand1} , ${operand2} , ${operand3} )`;
			}
			break;
		case FunctionCode.Abs:
			if (operand1) {
				return `abs( ${operand1} )`;
			}
			break;
		case FunctionCode.Float2:
			if (operand1 && operand2) {
				return `float2( ${operand1} , ${operand2} )`;
			}
			break;
		case FunctionCode.Time:
			return `time( )`;
		case FunctionCode.Random:
			if (operand1 && operand2) {
				return `random( ${operand1} , ${operand2} )`;
			}


		/*
			Sin = 0,
			Cos = 1,
			Tan = 2,
			Frac = 3,
			Floor = 4,
			Ceil = 5,
			Saturate = 6,
			Clamp = 7,
			Lerp = 8,
			Dot4 = 9,
			Dot3 = 10,
			Dot2 = 11,
			Log = 12,
			Log2 = 13,
			Log10 = 14,
			Exp = 15,
			Exp2 = 16,
			Sqrt = 17,
			Rsqrt = 18,
			Sign = 19,
			Abs = 20,
			Pow = 21,
			Step = 22,
			Smoothstep = 23,
			Float4 = 24,
			Float3 = 25,
			Float2 = 26,
			Time = 27,
			Min = 28,
			Max = 29,
			SrgbLinearToGamma = 30,
			SrgbGammaToLinear = 31,
			Random = 32,
			Normalize = 33,
			Length = 34,
			Sqr = 35,
			TextureSize = 36,
			*/

		default:
			console.error('Unknown function ', operand.function);
			break;
	}
	return '';
}
