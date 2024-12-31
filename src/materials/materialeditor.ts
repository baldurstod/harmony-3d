import { Entity } from '../entities/entity';
import '../css/materialeditor.css';
import { Material } from './material';
import { createElement, createShadowRoot } from 'harmony-ui';

function getUniformsHtml(uniforms: any/*TODO: create a proper type for uniforms*/) {
	let htmlUniforms = document.createElement('div');

	for (let uniformName in uniforms) {
		let uniform = uniforms[uniformName];

		htmlUniforms.append(addHtmlParameter(uniformName, uniform));
	}

	return htmlUniforms;
}

function addHtmlParameter(name: string, value: any) {
	let htmlParameter = document.createElement('div');
	let htmlParameterName = document.createElement('span');
	htmlParameterName.innerHTML = name;
	let htmlParameterValue = document.createElement('span');
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
	#shadowRoot!: ShadowRoot;
	#htmlHeader!: HTMLElement;
	//static #entity: Entity;
	#material?: Material;

	constructor() {
		if (MaterialEditor.#instance) {
			return MaterialEditor.#instance;
		}
		MaterialEditor.#instance = this;

		this.#shadowRoot = createShadowRoot('div', {
			childs: [
				this.#htmlHeader = createElement('div'),
			],
		});
	}

	#initHtml() {
		//this.#htmlElement = document.createElement('div');
		//this.#htmlElement.className = 'engine-material-editor';
		this.#refreshHtml();
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
		//if (this.#htmlElement) {
		this.#htmlHeader.innerText = '';
		let material = this.#material;
		if (material) {

			let fileName = material.name;
			if (fileName) {
				this.#htmlHeader.append(addHtmlParameter('filename', fileName));
			}
			//this.#htmlElement.innerHTML += this.material.name;
			this.#htmlHeader.append(getUniformsHtml(material.uniforms));

		}
		//}
	}

	getHTML() {
		return this.#shadowRoot.host;
	}
}
