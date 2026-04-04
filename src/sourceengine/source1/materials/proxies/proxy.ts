/*export setResult(variables, value) {
	let resultVarName = this.getData('resultvar');
	if (resultVarName) {
		resultVarName = resultVarName.toLowerCase();
		if (resultVarName.indexOf('[') != -1) {
			let result = (/([^\[]*)\[(\d*)\]/g).exec(resultVarName);
			if (result && result.length == 3) {
				const v = variables.get(result[1].toLowerCase());
				if (v) {
					v[result[2]] = value;
				}
			}
		} else {
			variables.set(resultVarName, value);
		}
	}
}
*/

import { DynamicParams } from '../../../../entities/entity';
import { Source1MaterialVariables, Source1MaterialVmt } from '../source1material';

/**
 * Source engine material interface
 */
export class Proxy {
	protected datas: Source1MaterialVmt = {};

	/**
	 * TODO
	 */
	setParams(datas: Source1MaterialVmt/*TODO: improve type*/, variables: Map<string, Source1MaterialVariables>): void {
		this.datas = datas;
		this.init(variables);
	}

	/**
	 * TODO
	 */
	getData(name: string): any {
		const result = this.datas[name];
		if (typeof result == 'string') {
			return result.toLowerCase();
		}
		return result;
	}

	/* eslint-disable @typescript-eslint/no-unused-vars */
	/* eslint-disable @typescript-eslint/no-empty-function */
	init(variables: Map<string, Source1MaterialVariables>): void { }
	execute(variables: Map<string, Source1MaterialVariables>, proxyParams: DynamicParams, time: number): void { }
	/* eslint-enable @typescript-eslint/no-unused-vars */
	/* eslint-enable @typescript-eslint/no-empty-function */

	setResult(variables: Map<string, Source1MaterialVariables>, value: any/*TODO: improve type*/): void {
		let resultVarName = this.getData('resultvar') as string;
		if (resultVarName) {
			resultVarName = resultVarName.toLowerCase();
			if (resultVarName.indexOf('[') != -1) {
				const result = (/([^\[]*)\[(\d*)\]/g).exec(resultVarName);
				if (result && result.length == 3) {
					const v = variables.get(result[1]!.toLowerCase());
					if (v) {

						if (typeof value == 'number') {
							v[result[2]!] = value;
						} else {//array
							v[result[2]!] = value[result[2]!];
						}
					}
				}
			} else {
				let v = variables.get(resultVarName);
				if ((v === undefined) && (value instanceof Array || value instanceof Float32Array)) {
					v = new Float32Array(value.length)
					variables.set(resultVarName, v);
				}

				if (v instanceof Array || v instanceof Float32Array) {
					v[0] = value?.[0] ?? value;
					v[1] = value?.[1] ?? value;
					v[2] = value?.[2] ?? value;
				} else {
					variables.set(resultVarName, value);
				}

			}
		}
	}

	getVariable(variables: Map<string, Source1MaterialVariables>, name: string): any {
		const result = this.datas[name];
		if (typeof result == 'string') {
			if (result.startsWith('$')) {
				const varName = result.toLowerCase();
				return variables.get(varName);

			} else {
				return result.toLowerCase();
			}
		}
		return result;
	}
}
