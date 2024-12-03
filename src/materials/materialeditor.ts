import { Entity } from '../entities/entity';
import '../css/materialeditor.css';
import { Material } from './material';

function getUniformsHtml(uniforms) {
	let htmlUniforms = document.createElement('div');

	for (let uniformName in uniforms) {
		let uniform = uniforms[uniformName];

		htmlUniforms.append(addHtmlParameter(uniformName, uniform));
	}

	return htmlUniforms;
}

function addHtmlParameter(name, value) {
	let htmlParameter = document.createElement('div');
	let htmlParameterName = document.createElement('span');
	htmlParameterName.innerHTML = name;
	let htmlParameterValue = document.createElement('span');
	htmlParameterValue.innerHTML = value;

	htmlParameter.append(htmlParameterName, htmlParameterValue);
	return htmlParameter;
}

export class MaterialEditor {
	static #htmlElement: HTMLElement;
	static #entity: Entity;
	static #material: Material;

	static initHtml() {
		this.#htmlElement = document.createElement('div');
		this.#htmlElement.className = 'engine-material-editor';
		this.refreshHtml();
	}

	static editEntity(entity) {
		this.#entity = entity;
		this.#material = entity?.material;
		this.refreshHtml();
	}

	static editMaterial(material) {
		this.#entity = null;
		this.#material = material;
		this.refreshHtml();
	}

	static refreshHtml() {
		if (this.#htmlElement) {
			this.#htmlElement.innerText = '';
			let material = this.#material;
			if (material) {

				let fileName = material.name;
				if (fileName) {
					this.#htmlElement.append(addHtmlParameter('filename', fileName));
				}
				//this.#htmlElement.innerHTML += this.material.name;
				this.#htmlElement.append(getUniformsHtml(material.uniforms));

			}
		}
	}

	static get html() {
		if (!this.#htmlElement) {
			this.initHtml();
		}
		return this.#htmlElement;
	}
}
