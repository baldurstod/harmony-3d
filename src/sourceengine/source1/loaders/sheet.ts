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
	m_TextureCoordData = [];
	constructor() {
		for (let i = 0; i < MAX_IMAGES_PER_FRAME_IN_MEMORY; ++i) {
			this.m_TextureCoordData[i] = new SequenceSampleTextureCoords_t();
		}
	}
}



export function GetInterpolationData(pKnotPositions, pKnotValues,
						nNumValuesinList,
						nInterpolationRange,
						flPositionToInterpolateAt,
						bWrap) {
	// first, find the bracketting knots by looking for the first knot >= our index
	let result = Object.create(null);
	let idx;
	for(idx = 0; idx < nNumValuesinList; idx++) {
		if (pKnotPositions[idx] >= flPositionToInterpolateAt) {
			break;
		}
	}
	let nKnot1, nKnot2;
	let flOffsetFromStartOfGap, flSizeOfGap;
	if (idx == 0) {
		if (bWrap) {
			nKnot1 = nNumValuesinList - 1;
			nKnot2 = 0;
			flSizeOfGap =
				(pKnotPositions[nKnot2] + (nInterpolationRange-pKnotPositions[nKnot1]));
			flOffsetFromStartOfGap =
				flPositionToInterpolateAt + (nInterpolationRange-pKnotPositions[nKnot1]);
		} else {
			result.pValueA = result.pValueB = pKnotValues[0];
			result.pInterpolationValue = 1.0;
			return result;
		}
	} else if (idx == nNumValuesinList) {						// ran out of values
		if (bWrap) {
			nKnot1 = nNumValuesinList -1;
			nKnot2 = 0;
			flSizeOfGap = (pKnotPositions[nKnot2] +
						(nInterpolationRange-pKnotPositions[nKnot1]));
			flOffsetFromStartOfGap = flPositionToInterpolateAt - pKnotPositions[nKnot1];
		} else {
			result.pValueA = result.pValueB = pKnotValues[nNumValuesinList-1];
			result.pInterpolationValue = 1.0;
			return result;
		}
	} else {
		nKnot1 = idx-1;
		nKnot2 = idx;
		flSizeOfGap = pKnotPositions[nKnot2]-pKnotPositions[nKnot1];
		flOffsetFromStartOfGap = flPositionToInterpolateAt-pKnotPositions[nKnot1];
	}

	function FLerp(f1, f2, i1, i2, x) {
		return f1+(f2-f1)*(x-i1)/(i2-i1);
	}


	result.pValueA = pKnotValues[nKnot1];
	result.pValueB = pKnotValues[nKnot2];
	result.pInterpolationValue = FLerp(0, 1, 0, flSizeOfGap, flOffsetFromStartOfGap);
	return result;
}