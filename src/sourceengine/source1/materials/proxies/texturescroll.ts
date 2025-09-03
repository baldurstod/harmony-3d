import { mat4 } from 'gl-matrix';
import { DynamicParams } from '../../../../entities/entity';
import { DEG_TO_RAD } from '../../../../math/constants';
import { Source1MaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

function toNumber(string: string) {
	const num = Number(string);
	if (!Number.isNaN(num)) {
		return num;
	}
}

export class TextureScroll extends Proxy {
	#textureScrollVar = '';
	#textureScrollRate = 1;
	#textureScrollAngle = 0;
	#textureScale = 1;

	init(variables: Map<string, Source1MaterialVariables>) {
		this.#textureScrollVar = (this.datas['texturescrollvar'] ?? '').toLowerCase();
		this.#textureScrollRate = toNumber(this.datas['texturescrollrate']) ?? 1;
		this.#textureScrollAngle = toNumber(String(DEG_TO_RAD * (this.datas['texturescrollangle']))) ?? 0;
		this.#textureScale = toNumber(this.datas['texturescale']) ?? 1;
		variables.set(this.#textureScrollVar, mat4.create());//TODO: fixme
	}

	execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number) {
		const rate = this.#textureScrollRate;
		const angle = this.#textureScrollAngle;
		const scale = this.#textureScale;

		const sOffset = time * Math.cos(angle) * rate;
		const tOffset = time * Math.sin(angle) * rate;

		// make sure that we are positive
		/*if(sOffset < 0.0) {
			sOffset += 1.0 + -(int)sOffset;
		}
		if(tOffset < 0.0) {
			tOffset += 1.0 + -(int)tOffset;
		}*/

		// make sure that we are in a [0,1] range
		//sOffset = sOffset - (int)sOffset;
		//tOffset = tOffset - (int)tOffset;

		const v = variables.get(this.#textureScrollVar);
		if (v) {
			v[0] = scale;
			v[1] = 0;
			v[2] = 0;
			v[3] = 0;
			v[4] = 0;
			v[5] = scale;
			v[6] = 0;
			v[7] = 0;
			v[8] = 0;
			v[9] = 0;
			v[10] = 1;
			v[11] = 0;
			v[12] = sOffset;
			v[13] = tOffset;
			v[14] = 0;
			v[15] = 1;
		}
		/*
			if (m_pTextureScrollVar->GetType() == MATERIAL_VAR_TYPE_MATRIX)
			{
				VMatrix mat(scale, 0.0f, 0.0f, sOffset,
					0.0f, scale, 0.0f, tOffset,
					0.0f, 0.0f, 1.0f, 0.0f,
					0.0f, 0.0f, 0.0f, 1.0f);
				m_pTextureScrollVar->SetMatrixValue(mat);
			}
			else
			{
				m_pTextureScrollVar->SetVecValue(sOffset, tOffset, 0.0f);
			}*/
	}
}
ProxyManager.registerProxy('TextureScroll', TextureScroll);

/*TextureScroll
 Returns a transform matrix or vector that will translate a texture at a given angle at a given rate.

textureScrollVar
Destination for the resulting transformation.
textureScrollRate
Rate of scroll in units per second.
textureScrollAngle
Angle of rotation to move along. (90 = up, 180 = left, etc)

		'TextureScroll'
		{
			'texturescrollvar'	'$BUMPTRANSFORM'
			'texturescrollrate'	.45
			'texturescrollangle'	85
		}
*/
