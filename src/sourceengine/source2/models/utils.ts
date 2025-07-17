import { Kv3Element } from '../../common/keyvalue/kv3element';
import { Source2AnimeDecoder } from './source2animgroup';

export function kv3ElementToDecoderArray(elements: Kv3Element[] | null): Source2AnimeDecoder[] {
	if (!elements) {
		return [];
	}

	const decoders: Source2AnimeDecoder[] = new Array(elements.length);
	for (let i = 0, l = elements.length; i < l; i++) {
		const element = elements[i] as Kv3Element;

		decoders[i] = {
			name: element.getValueAsString('m_szName') ?? '',
			version: element.getValueAsNumber('m_nVersion') ?? 0,
			type: element.getValueAsNumber('m_nType') ?? 0,
		};
	}
	return decoders;
}
