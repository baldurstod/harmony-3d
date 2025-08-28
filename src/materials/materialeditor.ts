import { Entity } from '../entities/entity';
import '../css/materialeditor.css';
import { Material } from './material';
import { createElement, createShadowRoot, hide, show } from 'harmony-ui';
import { GL_CONSTANT_ALPHA, GL_CONSTANT_COLOR, GL_DST_ALPHA, GL_DST_COLOR, GL_ONE, GL_ONE_MINUS_CONSTANT_ALPHA, GL_ONE_MINUS_CONSTANT_COLOR, GL_ONE_MINUS_DST_ALPHA, GL_ONE_MINUS_DST_COLOR, GL_ONE_MINUS_SRC_ALPHA, GL_ONE_MINUS_SRC_COLOR, GL_SRC_ALPHA, GL_SRC_ALPHA_SATURATE, GL_SRC_COLOR, GL_ZERO } from '../webgl/constants';
import { BlendingEquation, BlendingFactor } from '../enums/blending';

function getUniformsHtml(uniforms: any/*TODO: create a proper type for uniforms*/) {
	const htmlUniforms = createElement('div');

	for (const uniformName in uniforms) {
		const uniform = uniforms[uniformName];

		htmlUniforms.append(addHtmlParameter(uniformName, uniform));
	}

	return htmlUniforms;
}

function addHtmlParameter(name: string, value: any) {
	const htmlParameter = createElement('div');
	const htmlParameterName = createElement('span');
	htmlParameterName.innerText = name;
	const htmlParameterValue = createElement('span');
	htmlParameterValue.innerText = value;

	htmlParameter.append(htmlParameterName, htmlParameterValue);
	return htmlParameter;
}

let materialEditor: MaterialEditor | null = null;
export function getMaterialEditor() {
	if (!materialEditor) {
		materialEditor = new MaterialEditor();
	}
	return materialEditor;
}

export class MaterialEditor {
	static #instance: MaterialEditor;
	#shadowRoot: ShadowRoot;
	#htmlHeader: HTMLElement;
	#htmlShader: HTMLElement;
	#htmlBlending: HTMLElement;
	#htmlHasBlending: HTMLInputElement;
	#htmlBlendFactors = new Array<HTMLElement>(4);
	#htmlBlendSelects = new Array<HTMLSelectElement>(6);
	#htmlParams: HTMLElement;
	#material?: Material;

	constructor() {
		if (MaterialEditor.#instance) {
			return MaterialEditor.#instance;
		}
		MaterialEditor.#instance = this;

		const blendOptions: HTMLOptionElement[] = [];

		this.#shadowRoot = createShadowRoot('div', {
			childs: [
				this.#htmlHeader = createElement('div', {
					childs: [
						this.#htmlShader = createElement('div', {
						}),
						this.#htmlBlending = createElement('div', {
							childs: [
								createElement('label', {
									childs: [
										createElement('span', {
											i18n: '#enable_blending',
										}),
										this.#htmlHasBlending = createElement('input', {
											type: 'checkbox',
											events: {
												change: (event: Event) => this.#setBlending((event.target as HTMLInputElement).checked),
											}
										}) as HTMLInputElement,
									]
								}),
							]
						}),
						this.#htmlParams = createElement('div', {
						}),

					]
				}),
			],
		});

		const i18n = ['#source_color', '#source_alpha', '#destination_color', '#destination_alpha', '#mode_color', '#mode_alpha'];
		for (let i = 0; i < 6; i++) {
			this.#htmlBlendFactors[i] = createElement('div', {
				hidden: true,
				parent: this.#htmlBlending,
				childs: [
					createElement('span', {
						i18n: i18n[i],
					}),
					this.#htmlBlendSelects[i] = createElement('select', {
						list: 'factors',
						events: {
							change: (event: Event) => this.#changeBlendingFactor(i, (event.target as HTMLSelectElement).value),
						},
					}) as HTMLSelectElement,
				],
			});

			if (i < 4) {
				for (const suite in BlendingFactor) {
					const value = BlendingFactor[suite];
					if (typeof value === 'string') {
						(createElement('option', {
							parent: this.#htmlBlendSelects[i],
							innerText: value,
							value: value,
						}) as HTMLOptionElement);
					}
				}
			} else {
				for (const suite in BlendingEquation) {
					const value = BlendingEquation[suite];
					if (typeof value === 'string') {
						(createElement('option', {
							parent: this.#htmlBlendSelects[i],
							innerText: value,
							value: value,
						}) as HTMLOptionElement);
					}
				}
			}
		}
	}

	editEntity(entity: Entity) {
		//this.#entity = entity;
		this.#material = (entity as any).material;
		this.#refreshHtml();
	}

	editMaterial(material: Material) {
		//this.#entity = null;
		this.#material = material;
		this.#refreshHtml();
	}

	#refreshHtml() {
		this.#htmlParams.innerText = '';
		this.#htmlShader.innerText = '';
		const material = this.#material;
		if (!material) {
			return;
		}

		const fileName = material.name;
		if (fileName) {
			this.#htmlParams.append(addHtmlParameter('filename', fileName));
		}

		this.#htmlShader.append(addHtmlParameter('shader', material.getShaderSource()));

		this.#htmlBlendSelects[0].value = BlendingFactor[this.#material.srcRGB];
		this.#htmlBlendSelects[1].value = BlendingFactor[this.#material.srcAlpha];
		this.#htmlBlendSelects[2].value = BlendingFactor[this.#material.dstRGB];
		this.#htmlBlendSelects[3].value = BlendingFactor[this.#material.dstAlpha];
		this.#htmlHasBlending.checked = this.#material.blend;


		if (material.blend) {
			show(this.#htmlBlendFactors);
		} else {
			hide(this.#htmlBlendFactors);
		}

		//this.#htmlElement.innerHTML += this.material.name;
		this.#htmlParams.append(getUniformsHtml(material.uniforms));

	}

	getHTML() {
		return this.#shadowRoot.host;
	}

	#setBlending(blending: boolean) {
		if (!this.#material) {
			return;
		}

		this.#material.blend = blending;
		this.#refreshHtml();
	}

	#changeBlendingFactor(i: number, blending: string) {
		if (!this.#material) {
			return;
		}
		let value: GLenum;
		if (i < 4) {
			value = BlendingFactor[blending];
		} else {
			value = BlendingEquation[blending];
		}
		switch (i) {
			case 0:// src color
				this.#material.srcRGB = value;
				break;
			case 1:// src alpha
				this.#material.srcAlpha = value;
				break;
			case 2:// dst color
				this.#material.dstRGB = value;
				break;
			case 3:// dst alpha
				this.#material.dstAlpha = value;
				break;
			case 4:// color mode
				this.#material.modeRGB = value;
				break;
			case 5:// alpha mode
				this.#material.modeAlpha = value;
				break;
		}
	}
}

const BlendFactors = new Map<GLenum, string>([
	[GL_ZERO, 'zero'],
	[GL_ONE, 'one'],
	[GL_SRC_COLOR, 'source color'],
	[GL_ONE_MINUS_SRC_COLOR, 'one minus source color'],
	[GL_DST_COLOR, 'destination color'],
	[GL_ONE_MINUS_DST_COLOR, 'one minus destination color'],

	[GL_SRC_ALPHA, 'source alpha'],
	[GL_ONE_MINUS_SRC_ALPHA, 'one minus source alpha'],
	[GL_DST_ALPHA, 'destination alpha'],
	[GL_ONE_MINUS_DST_ALPHA, 'one minus destination alpha'],

	[GL_CONSTANT_COLOR, 'constant color'],
	[GL_ONE_MINUS_CONSTANT_COLOR, 'one minus constant color'],
	[GL_CONSTANT_ALPHA, 'constant alpha'],
	[GL_ONE_MINUS_CONSTANT_ALPHA, 'one minus constant alpha'],
	[GL_SRC_ALPHA_SATURATE, 'alpha saturate'],
]);
