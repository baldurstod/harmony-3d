import { Ace } from 'ace-builds';
import { loadScript } from 'harmony-browser-utils';
import { createElement, hide, I18n, shadowRootStyle } from 'harmony-ui';
import { TESTING } from '../buildoptions';
import { ACE_EDITOR_URI } from '../constants';
import shaderEditorCSS from '../css/shadereditor.css';
import { Graphics } from '../graphics/graphics2';
import { ShaderManager } from '../managers/shadermanager';
import { ShaderType } from '../webgl/types';
import { getIncludeList, getIncludeSource, setCustomIncludeSource } from './includemanager';
import { ShaderEventTarget } from './shadereventtarget';

const EDIT_MODE_SHADER = 0;
const EDIT_MODE_INCLUDE = 1;

type Token = { start: number, value: string, row?: number };

export class ShaderEditor extends HTMLElement {
	#initialized = false;
	#recompileDelay = 1000;
	#annotationsDelay = 500;
	#editMode = EDIT_MODE_SHADER;
	#shadowRoot?: ShadowRoot;
	#shaderEditor?: Ace.Editor/*TODO: fix type*/;
	#htmlShaderNameSelect?: HTMLSelectElement;
	#htmlShaderRenderMode?: HTMLInputElement;
	#recompileTimeout?: number;
	#editorShaderName: string = '';
	#editorIncludeName: string = '';
	#shaderType: ShaderType = ShaderType.Vertex;
	#uuid?: Token;//TODO: change name
	#isOpen = false;
	#marker = -1;
	#sessions = new Map<string, Ace.EditSession>;

	initEditor(options: any = {}) {
		if (this.#initialized) {
			return;
		}

		this.#shadowRoot = this.attachShadow({ mode: 'closed' });
		shadowRootStyle(this.#shadowRoot, shaderEditorCSS);
		I18n.observeElement(this.#shadowRoot);


		const aceScript = options.aceUrl ?? ACE_EDITOR_URI;
		this.#initialized = true;

		this.style.cssText = 'display: flex;flex-direction: column;height: 100%;width: 100%;';
		this.#htmlShaderNameSelect = createElement('select') as HTMLSelectElement;
		this.#htmlShaderNameSelect.addEventListener('input', (event) => {
			const selectedOption = (event.target as HTMLSelectElement).selectedOptions[0];
			if (selectedOption) {
				if (selectedOption.getAttribute('data-shader')) {
					this.setEditorShaderName((event.target as HTMLSelectElement).value);
				}
				if (selectedOption.getAttribute('data-include')) {
					this.setEditorIncludeName((event.target as HTMLSelectElement).value);
				}
			}
		});

		this.#htmlShaderRenderMode = createElement('input') as HTMLInputElement;
		this.#htmlShaderRenderMode.addEventListener('input', (event) => {
			const n = Number((event.target as HTMLInputElement).value);
			if (Number.isNaN(n)) {
				Graphics.setIncludeCode('RENDER_MODE', '#undef RENDER_MODE')
			} else {
				Graphics.setIncludeCode('RENDER_MODE', '#define RENDER_MODE ' + n);
			}
		});

		const htmlCustomShaderButtons = createElement('div');
		if (options.displayCustomShaderButtons) {
			const htmlButtonSaveCustomShader = createElement('button', { i18n: '#save_custom_shader' });
			const htmlButtonLoadCustomShader = createElement('button', { i18n: '#load_custom_shader' });
			const htmlButtonRemoveCustomShader = createElement('button', { i18n: '#remove_custom_shader' });

			htmlCustomShaderButtons.append(htmlButtonSaveCustomShader, htmlButtonLoadCustomShader, htmlButtonRemoveCustomShader);
			this.#shadowRoot.append(htmlCustomShaderButtons);

			htmlButtonSaveCustomShader.addEventListener('click', () => this.#saveCustomShader());
			htmlButtonLoadCustomShader.addEventListener('click', () => this.#loadCustomShader());
			htmlButtonRemoveCustomShader.addEventListener('click', () => this.#removeCustomShader());
		}


		const c = createElement('div', { style: 'flex:1;' });
		if (!TESTING) {
			hide(this.#htmlShaderRenderMode);
		}
		this.#shadowRoot.append(this.#htmlShaderNameSelect, this.#htmlShaderRenderMode, htmlCustomShaderButtons, c);

		if (aceScript == '') {
			this.#initEditor2(c);
		} else {
			loadScript(aceScript).then(() => this.#initEditor2(c));
		}
		ShaderEventTarget.addEventListener('shaderadded', event => this.#reloadGLSLList());
		ShaderEventTarget.addEventListener('includeadded', event => this.#reloadGLSLList());
	}

	#initEditor2(id: HTMLElement) {
		this.#shaderEditor = (globalThis as any).ace.edit(id) as Ace.Editor;
		this.#shaderEditor.renderer.attachToShadowRoot();
		//this.#shaderEditor.$blockScrolling = Infinity;
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

		this.#initEditorEvents();
		this.#reloadGLSLList();
	}

	#reloadGLSLList() {
		if (!this.#shaderEditor) {
			return;
		}
		this.#htmlShaderNameSelect!.innerText = '';

		const shaderGroup = createElement('optgroup', { i18n: { label: '#shader_editor_shaders', }, parent: this.#htmlShaderNameSelect });

		const shaderList = [...ShaderManager.shaderList].sort();
		for (const shaderName of shaderList) {
			const option = createElement('option', {
				class: 'shader-editor-shader-list-shader',
				value: shaderName,
				innerHTML: shaderName,
				'data-shader': true,
				parent: shaderGroup
			}) as HTMLOptionElement;

			if (this.#editMode == EDIT_MODE_SHADER && this.getEditorShaderName() == shaderName) {
				option.selected = true;
			}
		}

		const includeGroup = createElement('optgroup', { i18n: { label: '#shader_editor_includes', }, parent: this.#htmlShaderNameSelect });
		const includeList = [...getIncludeList()].sort();
		for (const includeName of includeList) {
			const option = createElement('option', {
				class: 'shader-editor-shader-list-include',
				value: includeName,
				innerHTML: includeName,
				'data-include': true,
				parent: includeGroup
			}) as HTMLOptionElement;

			if (this.#editMode == EDIT_MODE_INCLUDE && this.getEditorIncludeName() == includeName) {
				option.selected = true;
			}
		}

		if (!this.getEditorShaderName() && !this.getEditorIncludeName()) {
			const selectedOption = this.#htmlShaderNameSelect!.selectedOptions[0];
			if (selectedOption) {
				if (selectedOption.getAttribute('data-shader')) {
					this.setEditorShaderName(selectedOption.value);
				}
			}
		}
	}

	getEditorShaderName() {
		return this.#editorShaderName;
	}

	setEditorShaderName(shaderName: string): void {
		if (!this.#shaderEditor) {
			return;
		}
		if (shaderName) {
			this.#editorShaderName = shaderName;
			this.#editorIncludeName = '';
			const editSession = this.#getSession(shaderName);

			this.#shaderEditor.setSession(editSession);
			const source = ShaderManager.getShaderSource(ShaderType.Vertex, this.#editorShaderName, true);
			if (source) {
				this.#shaderType = source.getType();
				this.#editMode = EDIT_MODE_SHADER;
				const code = source.getSource();
				//this.#shaderEditor.setValue(code);
				editSession.doc.setValue(code);
				ShaderManager.setCustomSource(this.#shaderType, this.#editorShaderName, code);

			}
			this.#setAnnotations(this.#editorShaderName);
		}
	}

	getEditorIncludeName() {
		return this.#editorIncludeName;
	}

	setEditorIncludeName(includeName: string, force = false): void {
		if (!this.#shaderEditor) {
			return;
		}
		if (includeName && (this.#editorIncludeName != includeName || force)) {
			const editSession = this.#getSession(includeName);
			this.#shaderEditor.setSession(editSession);
			this.#editorShaderName = '';
			if (this.#htmlShaderNameSelect) {
				this.#htmlShaderNameSelect.value = includeName;
			}
			this.#editorIncludeName = includeName;
			const source = getIncludeSource(this.#editorIncludeName, this.#shaderType);
			if (source) {
				//this.#shaderEditor.setValue(source);

				editSession.doc.setValue(source);
				this.#editMode = EDIT_MODE_INCLUDE;
			}
		}
	}

	#getSession(name: string): Ace.EditSession {
		let session = this.#sessions.get(name);
		if (!session) {
			const ace = (globalThis as any).ace;
			session = new ace.EditSession('', 'ace/mode/glsl') as Ace.EditSession;
			session.setUndoManager(new ace.UndoManager());
			session.on('change', () => {
				clearTimeout(this.#recompileTimeout);
				this.#recompileTimeout = setTimeout(() => { this.recompile() }, this.#recompileDelay);
			});
		}

		return session;
	}

	recompile(): void {
		if (!this.#shaderEditor) {
			return;
		}
		clearTimeout(this.#recompileTimeout);
		const customSource = this.#shaderEditor.getValue();

		if (this.#editMode == EDIT_MODE_SHADER) {
			ShaderManager.setCustomSource(this.#shaderType, this.#editorShaderName, customSource);
		} else {
			setCustomIncludeSource(this.#editorIncludeName, customSource, this.#shaderType);
			ShaderManager.resetShadersSource();
			Graphics.invalidateShaders();
		}

		if (customSource == '') {
			if (this.#editMode == EDIT_MODE_SHADER) {
				this.setEditorShaderName(this.#editorIncludeName);
			} else {
				this.setEditorIncludeName(this.#editorIncludeName, true);
			}
		} else {
			if (this.#editMode == EDIT_MODE_SHADER) {
				Graphics.invalidateShaders();
				setTimeout(() => this.#setAnnotations(this.#editorShaderName), this.#annotationsDelay);
			} else {
				setTimeout(() => this.#shaderEditor!.getSession().setAnnotations(ShaderManager.getIncludeAnnotations(this.#editorIncludeName)), this.#annotationsDelay);
			}
		}
	}

	#setAnnotations(shaderName: string) {
		if (!this.#shaderEditor) {
			return;
		}
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
		if (!this.#shaderEditor) {
			return;
		}
		const type = this.#editMode == EDIT_MODE_SHADER ? 'shader' : 'include';
		const name = this.#editMode == EDIT_MODE_SHADER ? this.getEditorShaderName() : this.getEditorIncludeName();
		this.dispatchEvent(new CustomEvent('save-custom-shader', { detail: { type: type, name: name, source: this.#shaderEditor.getValue() } }));
	}

	#loadCustomShader() {
		const type = this.#editMode == EDIT_MODE_SHADER ? 'shader' : 'include';
		const name = this.#editMode == EDIT_MODE_SHADER ? this.getEditorShaderName() : this.getEditorIncludeName();
		const shaderType = this.#editMode == EDIT_MODE_SHADER ? this.#shaderType : null;
		this.dispatchEvent(new CustomEvent('load-custom-shader', { detail: { type: type, name: name, shaderType: shaderType } }));

	}

	#removeCustomShader() {
		const type = this.#editMode == EDIT_MODE_SHADER ? 'shader' : 'include';
		const name = this.#editMode == EDIT_MODE_SHADER ? this.getEditorShaderName() : this.getEditorIncludeName();
		const shaderType = this.#editMode == EDIT_MODE_SHADER ? this.#shaderType : null;
		this.dispatchEvent(new CustomEvent('remove-custom-shader', { detail: { type: type, name: name, shaderType: shaderType } }));
	}

	#initEditorEvents() {
		this.#shaderEditor!.renderer.content.addEventListener('mousemove', (event: MouseEvent) => this.#onMouseMove(event));
		this.#shaderEditor!.renderer.content.addEventListener('click', (event: MouseEvent) => this.#onClick(event));
	}

	#onMouseMove(event: MouseEvent): void {
		if (!this.#shaderEditor) {
			return;
		}
		const canvasPos = this.#shaderEditor.renderer.scroller.getBoundingClientRect();
		const offset = (event.clientX + this.#shaderEditor.renderer.scrollLeft - canvasPos.left - (this.#shaderEditor.renderer as any).$padding) / this.#shaderEditor.renderer.characterWidth;
		const row = Math.floor((event.clientY + this.#shaderEditor.renderer.scrollTop - canvasPos.top) / this.#shaderEditor.renderer.lineHeight);
		const col = Math.round(offset);

		const screenPos = { row: row, column: col, side: offset - col > 0 ? 1 : -1 };
		const session = this.#shaderEditor.session;
		const docPos = session.screenToDocumentPosition(screenPos.row, screenPos.column);

		const selectionRange = this.#shaderEditor.selection.getRange();
		if (!selectionRange.isEmpty()) {
			/*
			if (selectionRange.start.row <= row && selectionRange.end.row >= row) {
				console.info('clear');
			}
				*/
			//return this.clear();
		}
		const token = this.#findUuid(docPos.row, docPos.column);

		this.#uuid = token;
		if (!token) {
			return this.#clearMarkers();
		}
		this.#isOpen = true
		this.#shaderEditor.renderer.setCursorStyle('pointer');

		session.removeMarker(this.#marker);

		const range = new (globalThis as any).ace.Range(token.row, token.start, token.row, token.start + token.value.length);
		this.#marker = session.addMarker(range, 'ace_link_marker', 'text', true);
	}

	#onClick(event: MouseEvent) {
		if (!this.#uuid) {
			return;
		}
		this.#selectToken(this.#uuid.value);
	}

	#findUuid(row: number, column: number): Token | undefined {
		if (!this.#shaderEditor) {
			return;
		}
		const session = this.#shaderEditor.session;
		const line: string = session.getLine(row);

		if (!line.trim().startsWith('#include')) {
			return;
		}

		const match = this.#getMatchAround(/\w+/g, line, column);
		if (!match) {
			return;
		}

		if (match.value == 'include') {
			return;
		}

		match.row = row;
		return match;
	};

	#getMatchAround(regExp: RegExp, line: string, col: number) {
		let match: undefined | Token;
		regExp.lastIndex = 0;
		line.replace(regExp, (str: string, ...args: any[]): string => {
			const offset = args[args.length - 2] as number;
			const length = str.length;
			if (offset <= col && offset + length > col) {

				match = {
					start: offset,
					value: str
				};
			}
			return '';
		});

		return match;
	};

	#selectToken(token: string) {
		this.setEditorIncludeName(token);
	}

	#clearMarkers() {
		if (!this.#shaderEditor) {
			return;
		}
		if (this.#isOpen) {
			this.#shaderEditor.session.removeMarker(this.#marker);
			this.#shaderEditor.renderer.setCursorStyle('');
			this.#isOpen = false;
		}
	};

}

if (window.customElements) {
	customElements.define('shader-editor', ShaderEditor);
}
