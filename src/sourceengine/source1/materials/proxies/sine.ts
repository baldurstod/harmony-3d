import { DynamicParams } from '../../../../entities/entity';
import { SourceEngineMaterialVariables } from '../source1material';
import { Proxy } from './proxy';
import { ProxyManager } from './proxymanager';

export class Sine extends Proxy {
	//#delta;
	//#mid;
	#period = 1;
	#sineperiod: number = 1;
	#timeoffset: number = 1;

	init() {
		this.#sineperiod = Number(this.datas['sineperiod'] ?? 1);
		//this.sinemin = this.datas['sinemin']*1; //TODO: check number
		//this.sinemax = this.datas['sinemax']*1;
		this.#timeoffset = Number(this.datas['timeoffset'] ?? 0);
		//this.#delta = (this.sinemax - this.sinemin)/2;
		//this.#mid = this.sinemin + this.#delta;
		this.#period = 2 * Math.PI / this.#sineperiod;
		//this.#delta = 1.0;
	}

	execute(variables: Map<string, SourceEngineMaterialVariables>, proxyParams: DynamicParams, time: number) {
		//TODO: use timeoffset
		const sineMin = this.getVariable(variables, 'sinemin') * 1;
		const sineMax = this.getVariable(variables, 'sinemax') * 1;
		const delta = (sineMax - sineMin) * 0.5;
		const mid = sineMin + delta;
		const value = mid + delta * Math.sin(time * this.#period);

		super.setResult(variables, value);
	}
}
ProxyManager.registerProxy('Sine', Sine);


/*Sine
Sine
 A sine wave.

sineperiod
Period between wave peaks, in seconds.
sinemin
sinemax
Values at the top and bottom of the wave
timeoffset
Used to offset the starting position of the wave
resultVar

resultVar $selfillumtint // The shader parameter to be manipulated
*/
