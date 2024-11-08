import { ShortcutHandler } from 'harmony-browser-utils';
import { createElement, hide, show, toggle, shadowRootStyle, I18n, createShadowRoot } from 'harmony-ui';
import { defineharmonycontextmenu } from 'harmony-ui/dist/define/defines';
import { SceneExplorerEvents } from './sceneexplorerevents';
import { Camera } from '../cameras/camera';
import { RotationControl } from '../controls/rotationcontrol';
import { TranslationControl } from '../controls/translationcontrol';
import { SceneExplorerEntity } from './sceneexplorerentity';
import { Entity } from '../entities/entity';
import { KeepOnlyLastChild } from '../entities/keeponlylastchild';
import { EntityObserver, PROPERTY_CHANGED } from '../entities/entityobserver';
import { GraphicsEvents } from '../graphics/graphicsevents';
import { ContextObserver } from '../helpers/contextobserver';
import { AmbientLight } from '../lights/ambientlight';
import { PointLight } from '../lights/pointlight';
import { SpotLight } from '../lights/spotlight';
import { MaterialEditor } from '../materials/materialeditor';
import { Decal } from '../objects/decal';
import { Group } from '../objects/group';
import { Target } from '../objects/target';
import { Text3D } from '../objects/text3d';
import { getHelper } from '../objects/helpers/helperfactory';
import { HitboxHelper } from '../objects/helpers/hitboxhelper';
import { Manipulator } from '../objects/helpers/manipulator';
import { SkeletonHelper } from '../objects/helpers/skeletonhelper';
import { WireframeHelper } from '../objects/helpers/wireframehelper';
import { Box } from '../primitives/box';
import { Cone } from '../primitives/cone';
import { Cylinder } from '../primitives/cylinder';
import { FullScreenQuad } from '../primitives/fullscreenquad';
import { Metaballs } from '../primitives/metaballs';
import { Plane } from '../primitives/plane';
import { Sphere } from '../primitives/sphere';

import { Source1ModelManager } from '../sourceengine/source1/models/source1modelmanager';
import { Source2ModelManager } from '../sourceengine/source2/models/source2modelmanager';
import { Source1ParticleControler } from '../sourceengine/source1/particles/source1particlecontroler';
import { Source2ParticleManager } from '../sourceengine/source2/particles/source2particlemanager';

import { Interaction } from '../utils/interaction';

import sceneExplorerCSS from '../css/sceneexplorer.css';
import { Wireframe } from '../objects/wireframe';

function FormatArray(array) {
	let arr = [];
	array.forEach((element) =>
		arr.push(element.toFixed(2))
	);
	return arr.join(' ');
}

const ENTITIES = [
	'',
	'AmbientLight',
	'Bone',
	'ControlPoint',
	'Light',
	'Camera',
	'PointLight',
	'Source1ModelInstance',
	'Source2ModelInstance',
]

export class SceneExplorer {
	static #instance: SceneExplorer;
	#scene;
	#selectedEntity: Entity;
	#manipulator;
	#skeletonHelper;
	#htmlProperties;
	#htmlHeader: HTMLElement;
	htmlFileSelector: HTMLElement;
	#htmlNameFilter: HTMLElement;
	htmlContextMenu: HTMLElement;
	#htmlTypeFilter: HTMLElement;
	#shadowRoot: ShadowRoot;
	#htmlName;
	#htmlId;
	#htmlPos;
	#htmlQuat;
	#htmlScale;
	#htmlWorldPos;
	#htmlWorldQuat;
	#htmlWorldScale;
	#htmlVisible;
	#htmlScene;
	#filterName = '';
	#filterType = '';
	#isVisible = false;
	#selectedHtml;
	selectedEntity: Entity;
	constructor() {
		if (SceneExplorer.#instance) {
			return SceneExplorer.#instance;
		}
		SceneExplorer.#instance = this;
		initEntitySubmenu();
		SceneExplorerEntity.explorer = this;
		this.#initHtml();
		this.#manipulator = new Manipulator({ visible: false });
		this.#skeletonHelper = new SkeletonHelper({ visible: false });

		new IntersectionObserver((entries, observer) => {
			let isVisible = this.#isVisible;
			for (let e of entries) {
				this.#isVisible = e.isIntersecting;
			}
			if (this.#isVisible && (this.#isVisible != isVisible)) {
				this.applyFilter();
			}
		}).observe(this.#shadowRoot.host);


		EntityObserver.addEventListener(PROPERTY_CHANGED, (event: CustomEvent) => this.#handlePropertyChanged(event.detail));
		SceneExplorerEvents.addEventListener('bonepicked', (event: CustomEvent) => this.selectEntity(event.detail.bone));
	}

	set scene(scene) {
		this.#scene = scene;
		this.#selectedEntity = scene;
		this.applyFilter();
	}

	get scene() {
		return this.#scene;
	}

	#refreshScene() {
		if (this.#scene) {
			this.#htmlScene.innerHTML = '';
			this.#htmlScene.append(this.#createEntityElement(this.#scene, true));
		}
	}

	get htmlElement() {
		return this.#shadowRoot.host;
	}

	#initHtml() {
		this.#shadowRoot = createShadowRoot('scene-explorer', {
			attributes: { tabindex: 1, },
			adoptStyle: sceneExplorerCSS,
		});
		I18n.observeElement(this.#shadowRoot);

		this.#htmlHeader = createElement('div', { class: 'scene-explorer-header' });
		this.#htmlScene = createElement('div', { class: 'scene-explorer-scene', attributes: { tabindex: 1, }, });
		this.htmlFileSelector = createElement('div', { class: 'scene-explorer-file-selector', attributes: { tabindex: 1, }, });
		hide(this.htmlFileSelector);

		this.#htmlProperties = createElement('div', { class: 'scene-explorer-properties', hidden: 1, attributes: { tabindex: 1, }, });
		this.#shadowRoot.append(this.#htmlHeader, this.#htmlScene, this.htmlFileSelector, this.#htmlProperties);
		defineharmonycontextmenu();
		this.htmlContextMenu = createElement('harmony-context-menu');

		this.#initHtmlHeader();
		this.#initHtmlProperties();
		this.applyFilter();
		new ShortcutHandler().addContext('scene-explorer,scene-explorer-nodes', this.#htmlScene);
		new ShortcutHandler().addContext('scene-explorer,scene-explorer-files', this.htmlFileSelector);
		new ShortcutHandler().addContext('scene-explorer,scene-explorer-properties', this.#htmlProperties);
	}

	#initHtmlHeader() {
		this.#htmlNameFilter = createElement('input');
		this.#htmlHeader.append(this.#htmlNameFilter);
		this.#htmlTypeFilter = createElement('select');
		this.#htmlHeader.append(this.#htmlTypeFilter);
		let manipulatorId = 'display_manipulator';
		const skeletonId = 'display_skeleton';
		let htmlDisplayManipulator = createElement('input', { type: 'checkbox', id: manipulatorId });

		let htmlDisplayManipulatorSpan = createElement('span');
		let htmlDisplayManipulatorLabel = createElement('label', { i18n: '#display_manipulator', htmlFor: manipulatorId });

		this.#htmlHeader.append(htmlDisplayManipulatorSpan);
		htmlDisplayManipulatorSpan.append(htmlDisplayManipulator, htmlDisplayManipulatorLabel);


		createElement('span', {
			parent: this.#htmlHeader,
			childs: [
				createElement('input', {
					type: 'checkbox',
					id: skeletonId,
					events: {
						change: (event) => this.#skeletonHelper.visible = event.target.checked
					}
				}),
				createElement('label', {
					i18n: '#display_skeleton',
					htmlFor: skeletonId,
				}),
			]
		})


		let propertiesId = 'display_properties';
		let htmlDisplayProperties = createElement('input') as HTMLInputElement;
		htmlDisplayProperties.type = 'checkbox';
		htmlDisplayProperties.id = propertiesId;
		htmlDisplayProperties.checked = false;

		let htmlDisplayPropertiesSpan = createElement('span');
		let htmlDisplayPropertiesLabel = createElement('label', { i18n: '#display_properties', htmlFor: propertiesId });

		this.#htmlHeader.append(htmlDisplayPropertiesSpan);
		htmlDisplayPropertiesSpan.append(htmlDisplayProperties, htmlDisplayPropertiesLabel);

		this.#htmlNameFilter.addEventListener('change', (event) => { this.#filterName = (event.target as HTMLInputElement).value.toLowerCase(); this.applyFilter(); });
		this.#htmlTypeFilter.addEventListener('change', (event) => { this.#filterType = (event.target as HTMLInputElement).value; this.applyFilter(); });
		htmlDisplayManipulator.addEventListener('change', (event) => this.#manipulator.visible = (event.target as HTMLInputElement).checked);
		htmlDisplayProperties.addEventListener('change', (event) => toggle(this.#htmlProperties));

		this.#populateTypeFilter();
	}

	#populateTypeFilter() {
		for (let type of ENTITIES) {
			let option = createElement('option', { innerHTML: type, value: type });
			this.#htmlTypeFilter.append(option);
		}
	}

	applyFilter() {
		if (this.#isVisible) {
			if (this.#filterName == '' && this.#filterType == '') {
				this.#refreshScene();
			} else {
				if (this.#scene) {
					let allEntities = this.#scene.getChildList();
					this.#htmlScene.innerHTML = '';
					for (let entity of allEntities) {
						if (this.#matchFilter(entity, this.#filterName, this.#filterType)) {
							this.#htmlScene.append(this.#createEntityElement(entity));
						}
					}
				}
			}
		}
	}

	#matchFilter(entity, name, type) {
		return (name ? entity.name && entity.name.toLowerCase().includes(name) : true) && (type ? entity['is' + type] : true);
	}

	#initHtmlProperties() {
		this.#htmlName = createElement('div', { class: 'scene-explorer-entity-title' });
		const htmlIdLabel = createElement('label', { i18n: '#id' });
		this.#htmlId = createElement('div', { class: 'scene-explorer-entity-id' });
		const htmlPosLabel = createElement('label', { i18n: '#position' });
		this.#htmlPos = createElement('div', { class: 'scene-explorer-entity-pos' });
		const htmlQuatLabel = createElement('label', { i18n: '#quaternion' });
		this.#htmlQuat = createElement('div', { class: 'scene-explorer-entity-quat' });
		const htmlScaleLabel = createElement('label', { i18n: '#scale' });
		this.#htmlScale = createElement('div', { class: 'scene-explorer-entity-scale' });
		const htmlWorldPosLabel = createElement('label', { i18n: '#world_position' });
		this.#htmlWorldPos = createElement('div', { class: 'scene-explorer-entity-world-pos' });
		const htmlWorldQuatLabel = createElement('label', { i18n: '#world_quaternion' });
		this.#htmlWorldQuat = createElement('div', { class: 'scene-explorer-entity-world-quat' });
		const htmlWorldScaleLabel = createElement('label', { i18n: '#world_scale' });
		this.#htmlWorldScale = createElement('div', { class: 'scene-explorer-entity-world-scale' });
		const htmlVisibleLabel = createElement('label', { i18n: '#visible' });
		this.#htmlVisible = createElement('input', {
			class: 'scene-explorer-entity-visible',
			type: 'checkbox',
			events: {
				input: () => this.#selectedEntity?.toggleVisibility?.()
			}
		});
		//this.htmlVisible.addEventListener('input', () => {if (this._currentEntity) this._currentEntity.toggleVisibility()});
		this.#htmlProperties.append(this.#htmlName, htmlIdLabel, this.#htmlId, htmlPosLabel, this.#htmlPos, htmlQuatLabel, this.#htmlQuat, htmlScaleLabel, this.#htmlScale, htmlWorldPosLabel, this.#htmlWorldPos, htmlWorldQuatLabel, this.#htmlWorldQuat, htmlWorldScaleLabel, this.#htmlWorldScale, htmlVisibleLabel, this.#htmlVisible);
	}

	#updateHtml() {
		if (this.#isVisible) {
			this.#updateEntityElement(this.#selectedEntity);
			/*for (let [element, entity] of this._activeEntities) {
				if (element.getRootNode() != document) {
					this._activeEntities.delete(element);
				} else {
					this.#updateEntityElement(element, entity);
				}
			}*/
			const scene = this.#scene;
			if (scene) {
				this.#manipulator.setCamera(scene.activeCamera);
			}
		}
	}

	#createEntityElement(entity, createExpanded = false) {
		let htmlEntityElement = SceneExplorerEntity.getEntityElement(entity);

		if (createExpanded) {
			htmlEntityElement.expand();
		}
		return htmlEntityElement;
	}

	#selectEntity(entity, htmlEntityElement) {
		this.#selectedEntity = entity;
		entity.addChild(this.#manipulator);
		if (this.#selectedHtml) {
			this.#selectedHtml.classList.remove('selected');
		}
		htmlEntityElement.classList.add('selected');
		this.#selectedHtml = htmlEntityElement;
	}

	selectEntity(entity) {
		this.#selectedEntity = entity;
		entity.addChild(this.#manipulator);
		entity.addChild(this.#skeletonHelper);
		if (this.#isVisible) {
			this.#updateEntityElement(entity);
		}
	}

	#updateEntityElement(entity) {
		if (entity) {
			//this.#updateEntityTitle(entity);
			this.#htmlName.innerText = entity.name ?? (entity.constructor as typeof Entity).getEntityName();
			this.#htmlId.innerText = entity.id;
			this.#htmlPos.innerText = FormatArray(entity.position);
			this.#htmlQuat.innerText = FormatArray(entity.quaternion);
			this.#htmlScale.innerText = FormatArray(entity.scale);
			this.#htmlWorldPos.innerText = FormatArray(entity.getWorldPosition());
			this.#htmlWorldQuat.innerText = FormatArray(entity.getWorldQuaternion());
			this.#htmlWorldScale.innerText = FormatArray(entity.getWorldScale());
			this.#htmlVisible.checked = entity.visible;
			if (entity.visibleSelf === undefined) {
				this.#htmlVisible.indeterminate = true;
			} else {
				this.#htmlVisible.indeterminate = false;
			}
		}
	}

	getEntityHtml(entity) {
		throw 'remove me';
		//return this._entitiesHtml.get(entity);
	}

	#handlePropertyChanged(detail) {
		if (this.#isVisible && detail.entity == this.#selectedEntity) {
			this.#updateEntityElement(this.#selectedEntity);
		}

		/*const entity = detail.entity;
		SceneExplorerEntity.#updateEntity(entity);
		if (detail.name === 'visible') {
			for (let child of entity.children) {
				SceneExplorerEntity.#updateEntity(child);
			}
		}*/
	}
}

function initEntitySubmenu() {
	Entity.addSubMenu = [
		{
			i18n: '#primitives', submenu:
				[
					{ i18n: '#box', f: (entity) => entity.addChild(new Box()) },
					{ i18n: '#cone', f: (entity) => entity.addChild(new Cone()) },
					{ i18n: '#cylinder', f: (entity) => entity.addChild(new Cylinder()) },
					{ i18n: '#fullscreenquad', f: (entity) => entity.addChild(new FullScreenQuad()) },
					{ i18n: '#metaballs', f: (entity) => entity.addChild(new Metaballs()) },
					{ i18n: '#plane', f: (entity) => entity.addChild(new Plane({ width: 1000, height: 1000 })) },
					{ i18n: '#sphere', f: (entity) => entity.addChild(new Sphere()) },
					{ i18n: '#text', f: (entity) => entity.addChild(new Text3D()) },
				]
		},
		{
			i18n: '#entities', submenu:
				[
					{ i18n: '#group', f: (entity) => entity.addChild(new Group()) },
					{ i18n: '#target', f: (entity) => entity.addChild(new Target()) },
					{ i18n: '#keeponlylastchild', f: (entity) => entity.addChild(new KeepOnlyLastChild()) },
					{ i18n: '#decal', f: (entity) => entity.addChild(new Decal()) },
				]
		},
		{
			i18n: '#lights', submenu:
				[
					{ i18n: '#ambient_light', f: (entity) => entity.addChild(new AmbientLight()) },
					{ i18n: '#point_light', f: (entity) => entity.addChild(new PointLight()) },
					{ i18n: '#spot_light', f: (entity) => entity.addChild(new SpotLight()) },
				]
		},
		{ i18n: '#camera', f: (entity) => ContextObserver.observe(GraphicsEvents, entity.addChild(new Camera())) },
		{
			i18n: '#control', submenu:
				[
					{
						i18n: '#rotation_control', f: (entity) => {
							let control = new RotationControl();
							let parent = entity.parent;
							if (parent) {
								parent.addChild(control);
							}
							control.addChild(entity);
						}
					},
					{
						i18n: '#translation_control', f: (entity) => {
							let control = new TranslationControl();
							let parent = entity.parent;
							if (parent) {
								parent.addChild(control);
							}
							control.addChild(entity);
						}
					},
				]
		},
		{ i18n: '#helper', f: (entity) => { let helper = getHelper(entity); if (helper) { entity.addChild(helper); }; } },
		{ i18n: '#wireframe', f: (entity) => entity.addChild(new WireframeHelper()) },
		{ i18n: '#wireframe2', f: (entity) => entity.addChild(new Wireframe()) },
		{ i18n: '#hitboxes', f: (entity) => entity.addChild(new HitboxHelper()) },
		{
			i18n: '#source1', submenu:
				[
					{
						i18n: '#model', f: async (entity) => {
							show(new SceneExplorer().htmlFileSelector);
							Interaction.selectFile(new SceneExplorer().htmlFileSelector, await Source1ModelManager.getModelList(), async (repository, modelName) => {
								console.error(modelName);
								//let instance = await Source1ModelManager.createInstance(modelName.repository, modelName.path + modelName.name, true);
								let instance = await Source1ModelManager.createInstance(repository, modelName, true);
								(new SceneExplorer().selectedEntity ?? entity).addChild(instance);
								let seq = instance.sourceModel.mdl.getSequenceById(0);
								if (seq) {
									instance.playSequence(seq.name);
								}
							});
						}
					},
					{
						i18n: '#particle_system', f: async (entity) => {
							show(new SceneExplorer().htmlFileSelector);
							Interaction.selectFile(new SceneExplorer().htmlFileSelector, await Source1ParticleControler.getSystemList(), async (repository, systemPath) => {
								let systemName = systemPath.split('/');
								let sys = await Source1ParticleControler.createSystem(repository, systemName[systemName.length - 1]);
								sys.start();
								(new SceneExplorer().selectedEntity ?? entity).addChild(sys);
							});
						}
					},
				]
		},
		{
			i18n: '#source2', submenu:
				[
					{
						i18n: '#model', f: async (entity) => {
							show(new SceneExplorer().htmlFileSelector);
							Interaction.selectFile(new SceneExplorer().htmlFileSelector, await Source2ModelManager.getModelList(), async (repository, modelName) => {
								console.error(modelName);
								let instance = await Source2ModelManager.createInstance(repository, modelName, true);
								(new SceneExplorer().selectedEntity ?? entity).addChild(instance);
								/*let seq = instance.sourceModel.mdl.getSequenceById(0);
								if (seq) {
									instance.playSequence(seq.name);
								}*/
							});
						}
					},
					{
						i18n: '#particle_system', f: async (entity) => {
							show(new SceneExplorer().htmlFileSelector);
							Interaction.selectFile(new SceneExplorer().htmlFileSelector, await Source2ParticleManager.getSystemList(), async (repository, systemPath) => {
								let systemName = systemPath.split('/');
								let sys = await Source2ParticleManager.getSystem(repository, systemPath);
								sys.name = systemName[systemName.length - 1];
								sys.start();
								(new SceneExplorer().selectedEntity ?? entity).addChild(sys);
							});
						}
					},
				]
		},
	];
}

Entity.editMaterial = function (entity) {
	MaterialEditor.editEntity(entity);
	/*
	let entityHtml = SceneExplorer.getEntityHtml(entity);
	if (entityHtml) {
		entityHtml.append(MaterialEditor.html);
	}
		*/
}
