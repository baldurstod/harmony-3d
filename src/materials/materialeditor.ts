import { Entity } from '../entities/entity';
import '../css/materialeditor.css';
import { Material } from './material';
import { createElement, createShadowRoot, hide, show } from 'harmony-ui';
import { GL_CONSTANT_ALPHA, GL_CONSTANT_COLOR, GL_DST_ALPHA, GL_DST_COLOR, GL_ONE, GL_ONE_MINUS_CONSTANT_ALPHA, GL_ONE_MINUS_CONSTANT_COLOR, GL_ONE_MINUS_DST_ALPHA, GL_ONE_MINUS_DST_COLOR, GL_ONE_MINUS_SRC_ALPHA, GL_ONE_MINUS_SRC_COLOR, GL_SRC_ALPHA, GL_SRC_ALPHA_SATURATE, GL_SRC_COLOR, GL_ZERO } from '../webgl/constants';
import { BlendingFactors } from '../enums/blending';

function getUniformsHtml(uniforms: any/*TODO: create a proper type for uniforms*/) {
	let htmlUniforms = createElement('div');

	for (let uniformName in uniforms) {
		let uniform = uniforms[uniformName];

		htmlUniforms.append(addHtmlParameter(uniformName, uniform));
	}

	return htmlUniforms;
}

function addHtmlParameter(name: string, value: any) {
	let htmlParameter = createElement('div');
	let htmlParameterName = createElement('span');
	htmlParameterName.innerHTML = name;
	let htmlParameterValue = createElement('span');
	htmlParameterValue.innerHTML = value;

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
	#htmlBlendFactors: Array<HTMLElement> = new Array(4);
	#htmlBlendSelects: Array<HTMLSelectElement> = new Array(4);
	#htmlParams: HTMLElement;
	#material?: Material;

	constructor() {
		if (MaterialEditor.#instance) {
			return MaterialEditor.#instance;
		}
		MaterialEditor.#instance = this;

		const blendOptions: Array<HTMLOptionElement> = [];

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
											i18n: '#has_blending',
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

		const i18n = ['#source_color', '#source_alpha', '#destination_color', '#destination_alpha'];
		for (let i = 0; i < 4; i++) {
			this.#htmlBlendFactors[i] = createElement('div', {
				hidden: 1,
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

			for (let suite in BlendingFactors) {
				const value = BlendingFactors[suite];
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
		let material = this.#material;
		if (!material) {
			return;
		}

		let fileName = material.name;
		if (fileName) {
			this.#htmlParams.append(addHtmlParameter('filename', fileName));
		}

		this.#htmlShader.append(addHtmlParameter('shader', material.getShaderSource()));

		this.#htmlBlendSelects[0].value = BlendingFactors[this.#material.srcRGB];
		this.#htmlBlendSelects[1].value = BlendingFactors[this.#material.srcAlpha];
		this.#htmlBlendSelects[2].value = BlendingFactors[this.#material.dstRGB];
		this.#htmlBlendSelects[3].value = BlendingFactors[this.#material.dstAlpha];
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
		const value = BlendingFactors[blending];
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
