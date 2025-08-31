import { vec3 } from 'gl-matrix';
import { DynamicParams } from '../../../../entities/entity';
import { lerp } from '../../../../math/functions';
import { SourceEngineMaterialVariables } from '../sourceenginematerial';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class StatTrakIllum extends Proxy {
	#resultVar = '';
	#minVal: number = 0;
	#maxVal: number = 0;

	init() {
		this.#resultVar = this.datas['resultvar'];
		this.#minVal = Number(this.datas['minval'] ?? 0);
		this.#maxVal = Number(this.datas['maxval'] ?? 1);
	}

	execute(variables: Map<string, SourceEngineMaterialVariables>, proxyParams: DynamicParams, time: number) {
		const glowMultiplier = proxyParams.GlowMultiplier ?? 0.5;
		const value = lerp(this.#minVal, this.#maxVal, glowMultiplier);
		variables.set(this.#resultVar, vec3.fromValues(value, value, value));
	}
}
ProxyManager.registerProxy('StatTrakIllum', StatTrakIllum);
