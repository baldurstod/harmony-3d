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
