import { mat4 } from 'gl-matrix';
import { DynamicParams } from '../../../../entities/entity';
import { SourceEngineMaterialVariables } from '../sourceenginematerial';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';
import { MatrixBuildTranslation } from './texturetransform';

const RESULT_VAR = '$basetexturetransform';

// TODO: deprecate ?  afaik was only used for csgo
export class WeaponLabelText extends Proxy {
	#displayDigit: number = 0;

	init() {
		this.#displayDigit = this.datas['displaydigit'] ?? 0;
	}

	execute(variables: Map<string, SourceEngineMaterialVariables>, proxyParams: DynamicParams, time: number) {
		const text = proxyParams.WeaponLabelText || '';
		const car = text.charCodeAt(this.#displayDigit);
		const mat = mat4.create();//TODOv3 optimize
		// 96 ASCII characters starting from 0x20 (space)
		let x, y;
		if ((car >= 32) && (car < 128)) {
			const i = car - 32;
			x = i % 12;
			y = Math.floor(i / 12);
		} else {
			x = 0;
			y = 0;
		}
		// Texture is 12*8 characters
		//const btt = variables.get('$basetexturetransform') || vec2.create();
		//btt[0]=x/12;
		// /btt[1]=y/8;
		//variables.set('$basetexturetransform', btt);

		MatrixBuildTranslation(mat, x / 12, y / 8, 0.0);
		const v = variables.get(RESULT_VAR);
		if (v) {
			mat4.copy(v, mat);
		} else {
			variables.set(RESULT_VAR, mat4.clone(mat));
		}
	}
}
ProxyManager.registerProxy('WeaponLabelText', WeaponLabelText);
ProxyManager.registerProxy('WeaponLabelTextPreview', WeaponLabelText);
