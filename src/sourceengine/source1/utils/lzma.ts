/*
Copyright (c) 2011 Juan Mellado

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
References:
- "LZMA SDK" by Igor Pavlov
	http://www.7-zip.org/sdk.html
- "The .lzma File Format" from xz documentation
	https://github.com/joachimmetz/xz/blob/master/doc/lzma-file-format.txt
*/

class OutWindow {
	#windowSize = 0;
	#buffer;
	#pos: number;
	#streamPos: number;
	#stream;
	create(windowSize) {
		if ((!this.#buffer) || (this.#windowSize !== windowSize)) {
			// using a typed array here gives a big boost on Firefox
			// not much change in chrome (but more memory efficient)
			this.#buffer = new Uint8Array(windowSize);
		}
		this.#windowSize = windowSize;
		this.#pos = 0;
		this.#streamPos = 0;
	}

	flush() {
		var size = this.#pos - this.#streamPos;
		if (size !== 0) {
			if (this.#stream.writeBytes) {
				this.#stream.writeBytes(this.#buffer, size);
			} else {
				for (var i = 0; i < size; i++) {
					this.#stream.writeByte(this.#buffer[i]);
				}
			}
			if (this.#pos >= this.#windowSize) {
				this.#pos = 0;
			}
			this.#streamPos = this.#pos;
		}
	}

	releaseStream() {
		this.flush();
		this.#stream = null;
	}

	setStream(stream) {
		this.releaseStream();
		this.#stream = stream;
	}

	init(solid) {
		if (!solid) {
			this.#streamPos = 0;
			this.#pos = 0;
		}
	}

	copyBlock(distance, len) {
		var pos = this.#pos - distance - 1;
		if (pos < 0) {
			pos += this.#windowSize;
		}
		while (len--) {
			if (pos >= this.#windowSize) {
				pos = 0;
			}
			this.#buffer[this.#pos++] = this.#buffer[pos++];
			if (this.#pos >= this.#windowSize) {
				this.flush();
			}
		}
	}

	putByte(b) {
		this.#buffer[this.#pos++] = b;
		if (this.#pos >= this.#windowSize) {
			this.flush();
		}
	}

	getByte(distance) {
		var pos = this.#pos - distance - 1;
		if (pos < 0) {
			pos += this.#windowSize;
		}
		return this.#buffer[pos];
	}
}

class RangeDecoder {
	#stream;
	#code;
	#range;

	setStream(stream) {
		this.#stream = stream;
	}

	releaseStream() {
		this.#stream = null;
	}

	init() {
		var i = 5;

		this.#code = 0;
		this.#range = -1;

		while (i--) {
			this.#code = (this.#code << 8) | this.#stream.readByte();
		}
	}

	decodeDirectBits(numTotalBits) {
		var result = 0, i = numTotalBits, t;

		while (i--) {
			this.#range >>>= 1;
			t = (this.#code - this.#range) >>> 31;
			this.#code -= this.#range & (t - 1);
			result = (result << 1) | (1 - t);

			if ((this.#range & 0xff000000) === 0) {
				this.#code = (this.#code << 8) | this.#stream.readByte();
				this.#range <<= 8;
			}
		}

		return result;
	}

	decodeBit(probs, index) {
		var prob = probs[index],
			newBound = (this.#range >>> 11) * prob;

		if ((this.#code ^ 0x80000000) < (newBound ^ 0x80000000)) {
			this.#range = newBound;
			probs[index] += (2048 - prob) >>> 5;
			if ((this.#range & 0xff000000) === 0) {
				this.#code = (this.#code << 8) | this.#stream.readByte();
				this.#range <<= 8;
			}
			return 0;
		}

		this.#range -= newBound;
		this.#code -= newBound;
		probs[index] -= prob >>> 5;
		if ((this.#range & 0xff000000) === 0) {
			this.#code = (this.#code << 8) | this.#stream.readByte();
			this.#range <<= 8;
		}
		return 1;
	}

}
export class LZMA {
	static initBitModels(probs, len) {
		while (len--) {
			probs[len] = 1024;
		}
	}
	static reverseDecode2(models, startIndex, rangeDecoder, numBitLevels) {
		var m = 1, symbol = 0, i = 0, bit;

		for (; i < numBitLevels; ++i) {
			bit = rangeDecoder.decodeBit(models, startIndex + m);
			m = (m << 1) | bit;
			symbol |= bit << i;
		}
		return symbol;
	}

	static decompress(properties, inStream, outStream, outSize) {
		var decoder = new Decoder();

		if (!decoder.setDecoderProperties(properties)) {
			throw Error("Incorrect lzma stream properties");
		}

		if (!decoder.decodeBody(inStream, outStream, outSize)) {
			throw Error("Error in lzma data stream");
		}

		return outStream;
	}
}

class BitTreeDecoder {
	#models = [];
	#numBitLevels;
	constructor(numBitLevels) {
		this.#numBitLevels = numBitLevels;
	}


	init() {
		LZMA.initBitModels(this.#models, 1 << this.#numBitLevels);
	}

	decode(rangeDecoder) {
		var m = 1, i = this.#numBitLevels;

		while (i--) {
			m = (m << 1) | rangeDecoder.decodeBit(this.#models, m);
		}
		return m - (1 << this.#numBitLevels);
	}

	reverseDecode(rangeDecoder) {
		var m = 1, symbol = 0, i = 0, bit;

		for (; i < this.#numBitLevels; ++i) {
			bit = rangeDecoder.decodeBit(this.#models, m);
			m = (m << 1) | bit;
			symbol |= bit << i;
		}
		return symbol;
	}
}

class LenDecoder {
	#choice = [];
	#lowCoder = [];
	#midCoder = [];
	#highCoder = new BitTreeDecoder(8);
	#numPosStates = 0;


	create(numPosStates) {
		for (; this.#numPosStates < numPosStates; ++this.#numPosStates) {
			this.#lowCoder[this.#numPosStates] = new BitTreeDecoder(3);
			this.#midCoder[this.#numPosStates] = new BitTreeDecoder(3);
		}
	}

	init() {
		var i = this.#numPosStates;
		LZMA.initBitModels(this.#choice, 2);
		while (i--) {
			this.#lowCoder[i].init();
			this.#midCoder[i].init();
		}
		this.#highCoder.init();
	}

	decode(rangeDecoder, posState) {
		if (rangeDecoder.decodeBit(this.#choice, 0) === 0) {
			return this.#lowCoder[posState].decode(rangeDecoder);
		}
		if (rangeDecoder.decodeBit(this.#choice, 1) === 0) {
			return 8 + this.#midCoder[posState].decode(rangeDecoder);
		}
		return 16 + this.#highCoder.decode(rangeDecoder);
	}
}

class Decoder2 {
	#decoders = [];


	init() {
		LZMA.initBitModels(this.#decoders, 0x300);
	}

	decodeNormal(rangeDecoder) {
		var symbol = 1;

		do {
			symbol = (symbol << 1) | rangeDecoder.decodeBit(this.#decoders, symbol);
		} while (symbol < 0x100);

		return symbol & 0xff;
	}

	decodeWithMatchByte(rangeDecoder, matchByte) {
		var symbol = 1, matchBit, bit;

		do {
			matchBit = (matchByte >> 7) & 1;
			matchByte <<= 1;
			bit = rangeDecoder.decodeBit(this.#decoders, ((1 + matchBit) << 8) + symbol);
			symbol = (symbol << 1) | bit;
			if (matchBit !== bit) {
				while (symbol < 0x100) {
					symbol = (symbol << 1) | rangeDecoder.decodeBit(this.#decoders, symbol);
				}
				break;
			}
		} while (symbol < 0x100);

		return symbol & 0xff;
	}
}

class LiteralDecoder {
	#coders;
	#numPrevBits;
	#numPosBits;
	#posMask;
	create(numPosBits, numPrevBits) {
		var i;

		if (this.#coders
			&& (this.#numPrevBits === numPrevBits)
			&& (this.#numPosBits === numPosBits)) {
			return;
		}
		this.#numPosBits = numPosBits;
		this.#posMask = (1 << numPosBits) - 1;
		this.#numPrevBits = numPrevBits;

		this.#coders = [];

		i = 1 << (this.#numPrevBits + this.#numPosBits);
		while (i--) {
			this.#coders[i] = new Decoder2();
		}
	}

	init() {
		var i = 1 << (this.#numPrevBits + this.#numPosBits);
		while (i--) {
			this.#coders[i].init();
		}
	}

	getDecoder(pos, prevByte) {
		return this.#coders[((pos & this.#posMask) << this.#numPrevBits)
			+ ((prevByte & 0xff) >>> (8 - this.#numPrevBits))];
	}
}

class Decoder {
	#outWindow = new OutWindow();
	#rangeDecoder = new RangeDecoder();
	#isMatchDecoders = [];
	#isRepDecoders = [];
	#isRepG0Decoders = [];
	#isRepG1Decoders = [];
	#isRepG2Decoders = [];
	#isRep0LongDecoders = [];
	#posSlotDecoder = [new BitTreeDecoder(6), new BitTreeDecoder(6), new BitTreeDecoder(6), new BitTreeDecoder(6)];
	#posDecoders = [];
	#posAlignDecoder = new BitTreeDecoder(4);
	#lenDecoder = new LenDecoder();
	#repLenDecoder = new LenDecoder();
	#literalDecoder = new LiteralDecoder();
	#dictionarySize = -1;
	#dictionarySizeCheck = -1;
	#posStateMask: number;

	setDictionarySize(dictionarySize) {
		if (dictionarySize < 0) {
			return false;
		}
		if (this.#dictionarySize !== dictionarySize) {
			this.#dictionarySize = dictionarySize;
			this.#dictionarySizeCheck = Math.max(this.#dictionarySize, 1);
			this.#outWindow.create(Math.max(this.#dictionarySizeCheck, 4096));
		}
		return true;
	}

	setLcLpPb(lc, lp, pb) {
		var numPosStates = 1 << pb;

		if (lc > 8 || lp > 4 || pb > 4) {
			return false;
		}

		this.#literalDecoder.create(lp, lc);

		this.#lenDecoder.create(numPosStates);
		this.#repLenDecoder.create(numPosStates);
		this.#posStateMask = numPosStates - 1;

		return true;
	}

	setProperties(props) {
		if (!this.setLcLpPb(props.lc, props.lp, props.pb)) {
			throw Error("Incorrect stream properties");
		}
		if (!this.setDictionarySize(props.dictionarySize)) {
			throw Error("Invalid dictionary size");
		}
	}

	decodeHeader(inStream) {

		var properties, lc, lp, pb,
			uncompressedSize,
			dictionarySize;

		if (inStream.size < 13) {
			return false;
		}

		// +------------+----+----+----+----+--+--+--+--+--+--+--+--+
		// | Properties |	Dictionary Size	|	 Uncompressed Size	 |
		// +------------+----+----+----+----+--+--+--+--+--+--+--+--+

		properties = inStream.readByte();
		lc = properties % 9;
		properties = ~~(properties / 9);
		lp = properties % 5;
		pb = ~~(properties / 5);

		dictionarySize = inStream.readByte();
		dictionarySize |= inStream.readByte() << 8;
		dictionarySize |= inStream.readByte() << 16;
		dictionarySize += inStream.readByte() * 16777216;

		uncompressedSize = inStream.readByte();
		uncompressedSize |= inStream.readByte() << 8;
		uncompressedSize |= inStream.readByte() << 16;
		uncompressedSize += inStream.readByte() * 16777216;

		inStream.readByte();
		inStream.readByte();
		inStream.readByte();
		inStream.readByte();

		return {
			// The number of high bits of the previous
			// byte to use as a context for literal encoding.
			lc: lc,
			// The number of low bits of the dictionary
			// position to include in literal_pos_state.
			lp: lp,
			// The number of low bits of the dictionary
			// position to include in pos_state.
			pb: pb,
			// Dictionary Size is stored as an unsigned 32-bit
			// little endian integer. Any 32-bit value is possible,
			// but for maximum portability, only sizes of 2^n and
			// 2^n + 2^(n-1) should be used.
			dictionarySize: dictionarySize,
			// Uncompressed Size is stored as unsigned 64-bit little
			// endian integer. A special value of 0xFFFF_FFFF_FFFF_FFFF
			// indicates that Uncompressed Size is unknown.
			uncompressedSize: uncompressedSize
		};
	}

	init() {
		var i = 4;

		this.#outWindow.init(false);

		LZMA.initBitModels(this.#isMatchDecoders, 192);
		LZMA.initBitModels(this.#isRep0LongDecoders, 192);
		LZMA.initBitModels(this.#isRepDecoders, 12);
		LZMA.initBitModels(this.#isRepG0Decoders, 12);
		LZMA.initBitModels(this.#isRepG1Decoders, 12);
		LZMA.initBitModels(this.#isRepG2Decoders, 12);
		LZMA.initBitModels(this.#posDecoders, 114);

		this.#literalDecoder.init();

		while (i--) {
			this.#posSlotDecoder[i].init();
		}

		this.#lenDecoder.init();
		this.#repLenDecoder.init();
		this.#posAlignDecoder.init();
		this.#rangeDecoder.init();
	}

	decodeBody(inStream, outStream, maxSize) {
		var state = 0, rep0 = 0, rep1 = 0, rep2 = 0, rep3 = 0, nowPos64 = 0, prevByte = 0,
			posState, decoder2, len, distance, posSlot, numDirectBits;

		this.#rangeDecoder.setStream(inStream);
		this.#outWindow.setStream(outStream);

		this.init();

		while (maxSize < 0 || nowPos64 < maxSize) {
			posState = nowPos64 & this.#posStateMask;

			if (this.#rangeDecoder.decodeBit(this.#isMatchDecoders, (state << 4) + posState) === 0) {
				decoder2 = this.#literalDecoder.getDecoder(nowPos64++, prevByte);

				if (state >= 7) {
					prevByte = decoder2.decodeWithMatchByte(this.#rangeDecoder, this.#outWindow.getByte(rep0));
				} else {
					prevByte = decoder2.decodeNormal(this.#rangeDecoder);
				}
				this.#outWindow.putByte(prevByte);

				state = state < 4 ? 0 : state - (state < 10 ? 3 : 6);

			} else {

				if (this.#rangeDecoder.decodeBit(this.#isRepDecoders, state) === 1) {
					len = 0;
					if (this.#rangeDecoder.decodeBit(this.#isRepG0Decoders, state) === 0) {
						if (this.#rangeDecoder.decodeBit(this.#isRep0LongDecoders, (state << 4) + posState) === 0) {
							state = state < 7 ? 9 : 11;
							len = 1;
						}
					} else {
						if (this.#rangeDecoder.decodeBit(this.#isRepG1Decoders, state) === 0) {
							distance = rep1;
						} else {
							if (this.#rangeDecoder.decodeBit(this.#isRepG2Decoders, state) === 0) {
								distance = rep2;
							} else {
								distance = rep3;
								rep3 = rep2;
							}
							rep2 = rep1;
						}
						rep1 = rep0;
						rep0 = distance;
					}
					if (len === 0) {
						len = 2 + this.#repLenDecoder.decode(this.#rangeDecoder, posState);
						state = state < 7 ? 8 : 11;
					}
				} else {
					rep3 = rep2;
					rep2 = rep1;
					rep1 = rep0;

					len = 2 + this.#lenDecoder.decode(this.#rangeDecoder, posState);
					state = state < 7 ? 7 : 10;

					posSlot = this.#posSlotDecoder[len <= 5 ? len - 2 : 3].decode(this.#rangeDecoder);
					if (posSlot >= 4) {

						numDirectBits = (posSlot >> 1) - 1;
						rep0 = (2 | (posSlot & 1)) << numDirectBits;

						if (posSlot < 14) {
							rep0 += LZMA.reverseDecode2(this.#posDecoders,
								rep0 - posSlot - 1, this.#rangeDecoder, numDirectBits);
						} else {
							rep0 += this.#rangeDecoder.decodeDirectBits(numDirectBits - 4) << 4;
							rep0 += this.#posAlignDecoder.reverseDecode(this.#rangeDecoder);
							if (rep0 < 0) {
								if (rep0 === -1) {
									break;
								}
								return false;
							}
						}
					} else {
						rep0 = posSlot;
					}
				}

				if (rep0 >= nowPos64 || rep0 >= this.#dictionarySizeCheck) {
					return false;
				}

				this.#outWindow.copyBlock(rep0, len);
				nowPos64 += len;
				prevByte = this.#outWindow.getByte(0);
			}
		}

		this.#outWindow.flush();
		this.#outWindow.releaseStream();
		this.#rangeDecoder.releaseStream();

		return true;
	}

	setDecoderProperties(properties) {
		var value, lc, lp, pb, dictionarySize;

		if (properties.size < 5) {
			return false;
		}

		value = properties.readByte();
		lc = value % 9;
		value = ~~(value / 9);
		lp = value % 5;
		pb = ~~(value / 5);

		if (!this.setLcLpPb(lc, lp, pb)) {
			return false;
		}

		dictionarySize = properties.readByte();
		dictionarySize |= properties.readByte() << 8;
		dictionarySize |= properties.readByte() << 16;
		dictionarySize += properties.readByte() * 16777216;

		return this.setDictionarySize(dictionarySize);
	}

}
