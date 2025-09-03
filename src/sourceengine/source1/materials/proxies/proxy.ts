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

import { DynamicParams } from "../../../../entities/entity";
import { SourceEngineMaterialVariables, SourceEngineMaterialVmt } from "../source1material";

/**
 * Source engine material interface
 */
export class Proxy {
	protected datas: any = null;

	/**
	 * TODO
	 */
	setParams(datas: SourceEngineMaterialVmt/*TODO: improve type*/, variables: Map<string, SourceEngineMaterialVariables>) {
		this.datas = datas;
		this.init(variables);
	}

	/**
	 * TODO
	 */
	getData(name: string) {
		const result = this.datas[name];
		if (typeof result == 'string') {
			return result.toLowerCase();
		}
		return result;
	}

	/**
	 * Dummy function
	 */
	init(variables: Map<string, SourceEngineMaterialVariables>) {
	}

	/**
	 * Dummy function
	 */
	execute(variables: Map<string, SourceEngineMaterialVariables>, proxyParams: DynamicParams, time: number) {
	}

	setResult(variables: Map<string, SourceEngineMaterialVariables>, value: any/*TODO: improve type*/) {
		let resultVarName = this.getData('resultvar');
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

	getVariable(variables: Map<string, SourceEngineMaterialVariables>, name: string) {
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
