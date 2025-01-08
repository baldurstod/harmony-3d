import { createElement, hide, I18n } from 'harmony-ui';

import { Graphics } from '../graphics/graphics';
import { ShaderManager } from '../managers/shadermanager';
import { ShaderEventTarget } from './shadereventtarget';
import { getIncludeList, getIncludeSource, setCustomIncludeSource } from './includemanager';

import { TESTING } from '../buildoptions';
import { ACE_EDITOR_URI } from '../constants';
import { ShaderType } from '../webgl/shadersource';

const EDIT_MODE_SHADER = 0;
const EDIT_MODE_INCLUDE = 1;

export class ShaderEditor extends HTMLElement {
	#initialized = false;
	#recompileDelay = 1000;
	#annotationsDelay = 500;
	#editMode = EDIT_MODE_SHADER;
	#shadowRoot;
	#shaderEditor;
	#htmlShaderNameSelect: HTMLSelectElement;
	#htmlShaderRenderMode: HTMLInputElement;
	#recompileTimeout: number;
	#editorShaderName: string;
	#editorIncludeName: string;
	#shaderType: ShaderType;

	initEditor(options: any = {}) {
		if (this.#initialized) {
			return;
		}

		this.#shadowRoot = this.attachShadow({ mode: 'closed' });
		I18n.observeElement(this.#shadowRoot);


		let aceScript = options.aceUrl ?? ACE_EDITOR_URI;
		this.#initialized = true;

		this.style.cssText = 'display: flex;flex-direction: column;height: 100%;width: 100%;';
		this.#htmlShaderNameSelect = createElement('select') as HTMLSelectElement;
		this.#htmlShaderNameSelect.addEventListener('input', (event) => {
			let selectedOption = (event.target as HTMLSelectElement).selectedOptions[0];
			if (selectedOption) {
				if (selectedOption.getAttribute('data-shader')) {
					this.editorShaderName = (event.target as HTMLSelectElement).value;
				}
				if (selectedOption.getAttribute('data-include')) {
					this.editorIncludeName = (event.target as HTMLSelectElement).value;
				}
			}
		});

		this.#htmlShaderRenderMode = createElement('input') as HTMLInputElement;
		this.#htmlShaderRenderMode.addEventListener('input', (event) => {
			let n = Number((event.target as HTMLInputElement).value);
			if (Number.isNaN(n)) {
				new Graphics().setIncludeCode('RENDER_MODE', '#undef RENDER_MODE')
			} else {
				new Graphics().setIncludeCode('RENDER_MODE', '#define RENDER_MODE ' + n);
			}
		});

		let htmlCustomShaderButtons = createElement('div');
		if (options.displayCustomShaderButtons) {
			let htmlButtonSaveCustomShader = createElement('button', { i18n: '#save_custom_shader' });
			let htmlButtonLoadCustomShader = createElement('button', { i18n: '#load_custom_shader' });
			let htmlButtonRemoveCustomShader = createElement('button', { i18n: '#remove_custom_shader' });

			htmlCustomShaderButtons.append(htmlButtonSaveCustomShader, htmlButtonLoadCustomShader, htmlButtonRemoveCustomShader);
			this.#shadowRoot.append(htmlCustomShaderButtons);

			htmlButtonSaveCustomShader.addEventListener('click', () => this.#saveCustomShader());
			htmlButtonLoadCustomShader.addEventListener('click', () => this.#loadCustomShader());
			htmlButtonRemoveCustomShader.addEventListener('click', () => this.#removeCustomShader());
		}


		let c = createElement('div', { style: 'flex:1;' });
		if (!TESTING) {
			hide(this.#htmlShaderRenderMode);
		}
		this.#shadowRoot.append(this.#htmlShaderNameSelect, this.#htmlShaderRenderMode, htmlCustomShaderButtons, c);

		if (aceScript == '') {
			this.#initEditor2(c);
		} else {
			loadScripts([aceScript], () => this.#initEditor2(c));//TODO: variable
		}
		ShaderEventTarget.addEventListener('shaderadded', event => this.#reloadGLSLList());
		ShaderEventTarget.addEventListener('includeadded', event => this.#reloadGLSLList());
	}

	#initEditor2(id) {
		this.#shaderEditor = globalThis.ace.edit(id);
		this.#shaderEditor.renderer.attachToShadowRoot();
		this.#shaderEditor.$blockScrolling = Infinity;
		this.#shaderEditor.setTheme('ace/theme/monokai');
		this.#shaderEditor.getSession().setMode('ace/mode/glsl');
		this.#shaderEditor.getSession().on('change', () => {
			clearTimeout(this.#recompileTimeout);
			this.#recompileTimeout = setTimeout(() => { this.recompile() }, this.#recompileDelay);//TODO:
		});

		this.#shaderEditor.commands.addCommand({
			name: 'myCommand',
			bindKey: { win: 'Ctrl-Shift-C', mac: 'Command-M' },
			exec: () => {
				this.recompile();
			},
		});
		this.#reloadGLSLList();
	}

	#reloadGLSLList() {
		if (!this.#shaderEditor) {
			return;
		}
		this.#htmlShaderNameSelect.innerText = '';

		let shaderGroup = createElement('optgroup', { 'i18n-label': '#shader_editor_shaders', parent: this.#htmlShaderNameSelect });

		const shaderList = [...ShaderManager.shaderList].sort();
		for (let shaderName of shaderList) {
			const option = createElement('option', {
				class: 'shader-editor-shader-list-shader',
				value: shaderName,
				innerHTML: shaderName,
				'data-shader': true,
				parent: shaderGroup
			}) as HTMLOptionElement;

			if (this.#editMode == EDIT_MODE_SHADER && this.editorShaderName == shaderName) {
				option.selected = true;
			}
		}

		let includeGroup = createElement('optgroup', { 'i18n-label': '#shader_editor_includes', parent: this.#htmlShaderNameSelect });
		const includeList = [...getIncludeList()].sort();
		for (let includeName of includeList) {
			const option = createElement('option', {
				class: 'shader-editor-shader-list-include',
				value: includeName,
				innerHTML: includeName,
				'data-include': true,
				parent: includeGroup
			}) as HTMLOptionElement;

			if (this.#editMode == EDIT_MODE_INCLUDE && this.editorIncludeName == includeName) {
				option.selected = true;
			}
		}

		if (!this.editorShaderName && !this.editorIncludeName) {
			let selectedOption = this.#htmlShaderNameSelect.selectedOptions[0];
			if (selectedOption) {
				if (selectedOption.getAttribute('data-shader')) {
					this.editorShaderName = selectedOption.value;
				}
			}
		}
	}

	get editorShaderName() {
		return this.#editorShaderName;
	}

	set editorShaderName(shaderName) {
		if (shaderName) {
			this.#editorShaderName = shaderName;
			const source = ShaderManager.getShaderSource(undefined, this.#editorShaderName, true);
			if (source) {
				if (this.#shaderEditor) {
					this.#shaderEditor.setValue(source.getSource());
				}
				this.#shaderType = source.getType();
				this.#editMode = EDIT_MODE_SHADER;
			}
		}
	}

	get editorIncludeName() {
		return this.#editorIncludeName;
	}

	set editorIncludeName(includeName: string) {
		if (includeName) {
			this.#editorIncludeName = includeName;
			const source = getIncludeSource(this.#editorIncludeName);
			if (source) {
				this.#shaderEditor.setValue(source);
				this.#editMode = EDIT_MODE_INCLUDE;
			}
		}
	}

	recompile(): void {
		clearTimeout(this.#recompileTimeout);
		const customSource = this.#shaderEditor.getValue();

		if (this.#editMode == EDIT_MODE_SHADER) {
			ShaderManager.setCustomSource(this.#shaderType, this.#editorShaderName, customSource);
		} else {
			setCustomIncludeSource(this.#editorIncludeName, customSource);
			ShaderManager.resetShadersSource();
			new Graphics().invalidateShaders();
		}

		if (customSource == '') {
			if (this.#editMode == EDIT_MODE_SHADER) {
				this.editorShaderName = this.#editorShaderName;
			} else {
				this.editorIncludeName = this.#editorIncludeName;
			}
		} else {
			if (this.#editMode == EDIT_MODE_SHADER) {
				new Graphics().invalidateShaders();
				setTimeout(() => this.setAnnotations(this.#editorShaderName), this.#annotationsDelay);
			} else {
				setTimeout(() => this.#shaderEditor.getSession().setAnnotations(ShaderManager.getIncludeAnnotations(this.#editorIncludeName)), this.#annotationsDelay);
			}
		}
	}

	setAnnotations(shaderName: string) {
		if (shaderName == this.#editorShaderName) {
			this.#shaderEditor.getSession().setAnnotations(ShaderManager.getCustomSourceAnnotations(shaderName));
		}
	}

	set recompileDelay(delay: number) {
		this.#recompileDelay = delay;
	}

	set annotationsDelay(delay: number) {
		this.#annotationsDelay = delay;
	}

	#saveCustomShader() {
		let type = this.#editMode == EDIT_MODE_SHADER ? 'shader' : 'include';
		let name = this.#editMode == EDIT_MODE_SHADER ? this.editorShaderName : this.editorIncludeName;
		this.dispatchEvent(new CustomEvent('save-custom-shader', { detail: { type: type, name: name, source: this.#shaderEditor.getValue() } }));
	}

	#loadCustomShader() {
		let type = this.#editMode == EDIT_MODE_SHADER ? 'shader' : 'include';
		let name = this.#editMode == EDIT_MODE_SHADER ? this.editorShaderName : this.editorIncludeName;
		let shaderType = this.#editMode == EDIT_MODE_SHADER ? this.#shaderType : null;
		this.dispatchEvent(new CustomEvent('load-custom-shader', { detail: { type: type, name: name, shaderType: shaderType } }));

	}

	#removeCustomShader() {
		let type = this.#editMode == EDIT_MODE_SHADER ? 'shader' : 'include';
		let name = this.#editMode == EDIT_MODE_SHADER ? this.editorShaderName : this.editorIncludeName;
		let shaderType = this.#editMode == EDIT_MODE_SHADER ? this.#shaderType : null;
		this.dispatchEvent(new CustomEvent('remove-custom-shader', { detail: { type: type, name: name, shaderType: shaderType } }));
	}
}

if (window.customElements) {
	customElements.define('shader-editor', ShaderEditor);
}

function loadScripts(array, callback) {
	const loader = function (src, handler) {
		const script = createElement('script') as HTMLScriptElement;
		script.src = src;
		script.onload = () => {
			script.onload = null;
			handler();
		}
		const head = document.getElementsByTagName('head')[0];
		(head || document.body).appendChild(script);
	};
	(function run() {
		if (array.length != 0) {
			loader(array.shift(), run);
		} else {
			callback && callback();
		}
	})();
}
