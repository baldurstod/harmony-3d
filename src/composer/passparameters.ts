import { createElement, createShadowRoot } from 'harmony-ui';
import { BugReporter, Map2, StaticEventTarget } from 'harmony-utils';
import passParamsCSS from '../css/passparams.css';

export type PassParameterType = number | boolean;

export type PassParameter = {
	name: string;
	type: 'number' | 'boolean' | 'enum' | 'list' | 'range';
	/** Current value. If undefined, use default value */
	value?: PassParameterType;
	defaultValue: PassParameterType;
	/** For enum and list types, list of options */
	options?: Record<string, number>;
	/** For range type, minimum value. Defaults to 0 */
	min?: number;
	/** For range type, minimum value. Defaults to 100 */
	max?: number;
	/** For range type, step. Defaults to 1 */
	step?: number;
}

let dataListId = 0;
function getDataListId(): string {
	return `pass-parameter-datalist${++dataListId}`;
}

export interface PassParameterEvent {
	/** Pass name */
	pass: string,
	/** Param name */
	name: string,
	/** Param value */
	value: PassParameterType,
}

export class PassParameterEvents extends StaticEventTarget {
	static input(pass: string, name: string, value: PassParameterType) {
		this.dispatchEvent(new CustomEvent<PassParameterEvent>('input', { detail: { pass, name, value } }));
	}
}

const setters = new Map2<string, string, HTMLElement>();
export function createPassParameterUi(pass: string, param: PassParameter): HTMLElement | null {
	let element: ShadowRoot;
	let input: HTMLInputElement;
	switch (param.type) {
		case 'number':
			element = createShadowRoot('div', {
				adoptStyle: passParamsCSS,
				child: createElement('label', {
					childs: [
						createElement('span', {
							class: 'title',
							i18n: `#post_processing_param_${param.name}`,
						}),
						createElement('div', {
							class: 'content',
							childs: [
								input = createElement('input', {
									class: 'content',
									type: 'number',
									$input: (event: InputEvent) => PassParameterEvents.input(pass, param.name, Number((event.target as HTMLInputElement).value)),
								}) as HTMLInputElement,
							]
						}),
					],
				}),
			});
			setters.set(pass, param.name, input);
			break;
		case 'enum':
			const dataListId = getDataListId();
			let htmlInputDataList: HTMLElement = createElement('datalist', {
				id: dataListId,
			}) as HTMLDataListElement;

			let max: number = 0;
			if (param.options) {
				for (const name in param.options) {
					const value = param.options[name]!;
					createElement('option', {
						value: String(value),
						parent: htmlInputDataList,
						label: name,
					});
					max = Math.max(max, value);
				}
			}

			element = createShadowRoot('div', {
				adoptStyle: passParamsCSS,
				child: createElement('label', {
					childs: [
						createElement('span', {
							class: 'title',
							i18n: `#post_processing_param_${param.name}`,
						}),
						createElement('div', {
							class: 'content',
							childs: [
								input = createElement('input', {
									type: 'range',
									min: '0',
									max,
									list: dataListId,

									$input: (event: InputEvent) => PassParameterEvents.input(pass, param.name, Number((event.target as HTMLInputElement).value)),

								}) as HTMLInputElement,
								htmlInputDataList,
							],
						}),
					],
				}),
			});
			setters.set(pass, param.name, input);
			break;
		case 'range':
			element = createShadowRoot('div', {
				adoptStyle: passParamsCSS,
				child: createElement('label', {
					childs: [
						createElement('span', {
							class: 'title',
							i18n: `#post_processing_param_${param.name}`,
						}),
						createElement('div', {
							class: 'content',
							childs: [
								input = createElement('input', {
									type: 'range',
									min: param.min ?? 0,
									max: param.max ?? 100,
									step: param.step ?? 1,
									$input: (event: InputEvent) => PassParameterEvents.input(pass, param.name, Number((event.target as HTMLInputElement).value)),
								}) as HTMLInputElement,
							],
						}),
					],
				}),
			});
			setters.set(pass, param.name, input);
			break;
		default:
			BugReporter.reportBug('warning', `Missing pass parameter type: ${param.type}`);
			break;
	}
	return (element!?.host) as HTMLElement ?? null;
}
