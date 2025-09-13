export const MAX_IMAGES_PER_FRAME_ON_DISK = 4;
export const MAX_IMAGES_PER_FRAME_IN_MEMORY = 2;
export const MAX_SEQUENCES = 64;
export const SEQUENCE_SAMPLE_COUNT = 1024;

class SequenceSampleTextureCoords_t {
	m_fLeft_U0 = 0;
	m_fTop_V0 = 0;
	m_fRight_U0 = 0;
	m_fBottom_V0 = 0;
	m_fLeft_U1 = 0;
	m_fTop_V1 = 0;
	m_fRight_U1 = 0;
	m_fBottom_V1 = 0;
}

export class SheetSequenceSample_t {
	m_fBlendFactor = 0;
	m_TextureCoordData: SequenceSampleTextureCoords_t[] = [];
	constructor() {
		for (let i = 0; i < MAX_IMAGES_PER_FRAME_IN_MEMORY; ++i) {
			this.m_TextureCoordData[i] = new SequenceSampleTextureCoords_t();
		}
	}
}

export function GetInterpolationData(pKnotPositions: Float32Array, pKnotValues: Float32Array,
	nNumValuesinList: number,
	nInterpolationRange: number,
	flPositionToInterpolateAt: number,
	bWrap: boolean): { pValueA: number, pValueB: number, pInterpolationValue: number } {

	if (nNumValuesinList > SEQUENCE_SAMPLE_COUNT) {
		return { pValueA: 0, pValueB: 0, pInterpolationValue: 0 };
	}

	// first, find the bracketting knots by looking for the first knot >= our index
	const result = Object.create(null);
	let idx;
	for (idx = 0; idx < nNumValuesinList; idx++) {
		if (pKnotPositions[idx]! >= flPositionToInterpolateAt) {
			break;
		}
	}
	let nKnot1, nKnot2;
	let flOffsetFromStartOfGap, flSizeOfGap;
	if (idx == 0) {
		if (bWrap) {
			nKnot1 = Math.max(nNumValuesinList - 1, 0);
			nKnot2 = 0;
			flSizeOfGap =
				(pKnotPositions[nKnot2]! + (nInterpolationRange - pKnotPositions[nKnot1]!));
			flOffsetFromStartOfGap =
				flPositionToInterpolateAt + (nInterpolationRange - pKnotPositions[nKnot1]!);
		} else {
			result.pValueA = result.pValueB = pKnotValues[0];
			result.pInterpolationValue = 1.0;
			return result;
		}
	} else if (idx == nNumValuesinList) {						// ran out of values
		if (bWrap) {
			nKnot1 = nNumValuesinList - 1;
			nKnot2 = 0;
			flSizeOfGap = (pKnotPositions[nKnot2]! +
				(nInterpolationRange - pKnotPositions[nKnot1]!));
			flOffsetFromStartOfGap = flPositionToInterpolateAt - pKnotPositions[nKnot1]!;
		} else {
			result.pValueA = result.pValueB = pKnotValues[nNumValuesinList - 1];
			result.pInterpolationValue = 1.0;
			return result;
		}
	} else {
		nKnot1 = idx - 1;
		nKnot2 = idx;
		flSizeOfGap = pKnotPositions[nKnot2]! - pKnotPositions[nKnot1]!;
		flOffsetFromStartOfGap = flPositionToInterpolateAt - pKnotPositions[nKnot1]!;
	}

	function FLerp(f1: number, f2: number, i1: number, i2: number, x: number) {
		// TODO: use a common function
		return f1 + (f2 - f1) * (x - i1) / (i2 - i1);
	}


	result.pValueA = pKnotValues[nKnot1];
	result.pValueB = pKnotValues[nKnot2];
	result.pInterpolationValue = FLerp(0, 1, 0, flSizeOfGap, flOffsetFromStartOfGap);
	return result;
}
