import { quat, vec3 } from 'gl-matrix';
import { ShortcutHandler } from 'harmony-browser-utils';
import { dragPanSVG, panZoomSVG, rotateSVG } from 'harmony-svg';
import { HTMLHarmonyAccordionElement, HTMLHarmonyMenuElement, HarmonyMenuItems, I18n, createElement, createShadowRoot, defineHarmonyAccordion, defineHarmonyMenu, display, show } from 'harmony-ui';
import { Camera } from '../cameras/camera';
import { RotationControl } from '../controls/rotationcontrol';
import { TranslationControl } from '../controls/translationcontrol';
import sceneExplorerCSS from '../css/sceneexplorer.css';
import { Entity } from '../entities/entity';
import { EntityObserver, EntityObserverEventType, EntityObserverPropertyChangedEvent } from '../entities/entityobserver';
import { KeepOnlyLastChild } from '../entities/keeponlylastchild';
import { Graphics } from '../graphics/graphics2';
import { GraphicPickEvent, GraphicsEvent, GraphicsEvents } from '../graphics/graphicsevents';
import { AmbientLight } from '../lights/ambientlight';
import { PointLight } from '../lights/pointlight';
import { SpotLight } from '../lights/spotlight';
import { Material } from '../materials/material';
import { getMaterialEditor } from '../materials/materialeditor';
import { Decal } from '../objects/decal';
import { Group } from '../objects/group';
import { getHelper } from '../objects/helpers/helperfactory';
import { HitboxHelper } from '../objects/helpers/hitboxhelper';
import { Manipulator, ManipulatorMode } from '../objects/helpers/manipulator';
import { SkeletonHelper } from '../objects/helpers/skeletonhelper';
import { WireframeHelper } from '../objects/helpers/wireframehelper';
import { Target } from '../objects/target';
import { Text2D } from '../objects/text2d';
import { Text3D } from '../objects/text3d';
import { Wireframe } from '../objects/wireframe';
import { Box } from '../primitives/box';
import { Cone } from '../primitives/cone';
import { Cylinder } from '../primitives/cylinder';
import { FullScreenQuad } from '../primitives/fullscreenquad';
import { Metaballs } from '../primitives/metaballs';
import { Plane } from '../primitives/plane';
import { Sphere } from '../primitives/sphere';
import { Source1ModelManager } from '../sourceengine/source1/models/source1modelmanager';
import { Source1ParticleControler } from '../sourceengine/source1/particles/source1particlecontroler';
import { Source2ModelManager } from '../sourceengine/source2/models/source2modelmanager';
import { Source2ParticleManager } from '../sourceengine/source2/particles/source2particlemanager';
import { Interaction } from '../utils/interaction';
import { Scene } from './scene';
import { SceneExplorerEntity } from './sceneexplorerentity';
import { SceneExplorerEvents } from './sceneexplorerevents';

function FormatArray(array: number[] | vec3 | quat): string {
	const arr: string[] = [];
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

let sceneExplorer: SceneExplorer | null = null;
export function getSceneExplorer(): SceneExplorer {
	if (!sceneExplorer) {
		sceneExplorer = new SceneExplorer();
	}
	return sceneExplorer;
}

export class SceneExplorer {
	static #instance: SceneExplorer;
	#scene?: Scene;
	#selectedEntity: Entity | null = null;
	#manipulator!: Manipulator;
	#skeletonHelper = new SkeletonHelper({ visible: false, hideInExplorer: true, });
	#htmlProperties!: HTMLElement;
	#htmlFileExplorer!: HTMLElement;
	#htmlMaterialEditor!: HTMLElement;
	#htmlExtra!: HTMLHarmonyAccordionElement;
	#htmlHeader!: HTMLElement;
	htmlFileSelector!: HTMLElement;
	#htmlNameFilter!: HTMLInputElement;
	#htmlContextMenu!: HTMLHarmonyMenuElement;
	#htmlTypeFilter!: HTMLSelectElement;
	#htmlDisplayBoneJoints!: HTMLElement;
	#htmlDisplayBoneAsLines!: HTMLElement;
	#shadowRoot!: ShadowRoot;
	#htmlName!: HTMLElement;
	#htmlId!: HTMLElement;
	#htmlPos!: HTMLElement;
	#htmlQuat!: HTMLElement;
	#htmlScale!: HTMLElement;
	#htmlWorldPos!: HTMLElement;
	#htmlWorldQuat!: HTMLElement;
	#htmlWorldScale!: HTMLElement;
	//#htmlVisible!: HTMLInputElement;
	#htmlScene!: HTMLElement;
	#filterName = '';
	#filterType = '';
	#isVisible = false;
	//selectedEntity?: Entity;

	constructor() {
		if (SceneExplorer.#instance) {
			return SceneExplorer.#instance;
		}
		this.#initHtml();
		SceneExplorer.#instance = this;
		initEntitySubmenu();
		SceneExplorerEntity.setExplorer(this);
		this.#manipulator = new Manipulator({ visible: false });

		new IntersectionObserver((entries) => {
			const isVisible = this.#isVisible;
			for (const e of entries) {
				this.#isVisible = e.isIntersecting;
			}
			if (this.#isVisible && (this.#isVisible != isVisible)) {
				this.#applyFilter();
				if (this.#selectedEntity) {
					SceneExplorerEntity.getEntityElement(this.#selectedEntity)?.select();
				}
			}
		}).observe(this.#shadowRoot.host);


		EntityObserver.addEventListener(EntityObserverEventType.PropertyChanged, (event: Event) => this.#handlePropertyChanged((event as CustomEvent<EntityObserverPropertyChangedEvent>).detail));
		SceneExplorerEvents.addEventListener('bonepicked', (event: Event) => this.selectEntity((event as CustomEvent).detail.bone, true));

		GraphicsEvents.addEventListener(GraphicsEvent.Pick, (event: Event) => {
			if (Graphics.dragging || this.#skeletonHelper.isVisible()) {
				return;
			}

			const entity = (event as CustomEvent<GraphicPickEvent>).detail.entity;
			if (entity) {
				this.selectEntity(entity, true);
			}
		});
	}

	/**
	 * @deprecated Please use `setScene` instead.
	 */
	set scene(scene: Scene) {//TODO: deprecate
		console.warn('deprecated, use setScene instead');
		this.setScene(scene);
	}

	get scene(): Scene | undefined {
		return this.#scene;
	}

	setScene(scene: Scene): void {
		this.#scene = scene;
		this.selectEntity(scene, true);
		this.#applyFilter();
	}

	#refreshScene(visibleEntities?: Set<Entity>): void {
		if (this.#scene) {
			this.#htmlScene.innerText = '';
			this.#htmlScene.append(this.#createEntityElement(this.#scene, true, visibleEntities)!);
		}
	}

	get htmlElement(): HTMLElement {
		return this.#shadowRoot.host as HTMLElement;
	}

	#initHtml(): void {
		defineHarmonyAccordion();
		this.#shadowRoot = createShadowRoot('scene-explorer', {
			attributes: { tabindex: '1', },
			adoptStyle: sceneExplorerCSS,
			childs: [
				this.#htmlHeader = createElement('div', { class: 'scene-explorer-header' }),
				this.#htmlScene = createElement('div', { class: 'scene-explorer-scene', attributes: { tabindex: '1', }, }),
				this.htmlFileSelector = createElement('div', {
					class: 'scene-explorer-file-selector',
					hidden: true,
					attributes: { tabindex: '1', },
				}),
				this.#htmlExtra = createElement('harmony-accordion', {
					multiple: 1,
					childs: [
						createElement('harmony-item', {
							id: 'properties',
							childs: [
								createElement('div', {
									slot: 'header',
									i18n: '#properties',
								}),
								this.#htmlProperties = createElement('div', {
									class: 'scene-explorer-properties',
									slot: 'content',
									attributes: {
										tabindex: '1',
									},
								}),
							],
						}),
						createElement('harmony-item', {
							id: 'files',
							hidden: true,
							childs: [
								createElement('div', {
									slot: 'header',
									i18n: '#files',
								}),
								this.#htmlFileExplorer = createElement('div', {
									class: 'file-explorer',
									slot: 'content',
									attributes: {
										tabindex: '1',
									},
								}),
							],
						}),
						createElement('harmony-item', {
							id: 'material',
							hidden: true,
							childs: [
								createElement('div', {
									slot: 'header',
									i18n: '#material_editor',
								}),
								this.#htmlMaterialEditor = createElement('div', {
									class: 'material-editor',
									slot: 'content',
									attributes: {
										tabindex: '1',
									},
								}),
							],
						}),
					],
				}) as HTMLHarmonyAccordionElement,
			],
		});
		I18n.observeElement(this.#shadowRoot);

		defineHarmonyMenu();
		this.#htmlContextMenu = createElement('harmony-menu') as HTMLHarmonyMenuElement;

		this.#initHtmlHeader();
		this.#initHtmlProperties();
		this.#applyFilter();
		ShortcutHandler.addContext('scene-explorer,scene-explorer-nodes', this.#htmlScene);
		ShortcutHandler.addContext('scene-explorer,scene-explorer-files', this.htmlFileSelector);
		ShortcutHandler.addContext('scene-explorer,scene-explorer-properties', this.#htmlProperties);
	}

	#initHtmlHeader(): void {
		this.#htmlNameFilter = createElement('input', {
			parent: this.#htmlHeader,
		}) as HTMLInputElement;
		this.#htmlTypeFilter = createElement('select', {
			parent: this.#htmlHeader,
		}) as HTMLSelectElement;

		let htmlManipulator: HTMLInputElement;
		createElement('span', {
			class: 'manipulator',
			parent: this.#htmlHeader,
			childs: [
				createElement('label', {
					childs: [
						htmlManipulator = createElement('input', {
							type: 'checkbox',
							events: {
								change: (event: Event) => this.#manipulator.setVisible((event.target as HTMLInputElement).checked),
							},
						}) as HTMLInputElement,
						createElement('span', { i18n: '#display_manipulator', }),
					],
				}),
				createElement('span', {
					class: 'manipulator-button',
					innerHTML: dragPanSVG,
					events: {
						click: () => {
							this.#manipulator.setMode(ManipulatorMode.Translation);
							htmlManipulator.checked = true;
							this.#manipulator.setVisible(true);
						},
					}
				}),
				createElement('span', {
					class: 'manipulator-button',
					innerHTML: rotateSVG,
					events: {
						click: () => {
							this.#manipulator.setMode(ManipulatorMode.Rotation);
							htmlManipulator.checked = true;
							this.#manipulator.setVisible(true);
						},
					}
				}),
				createElement('span', {
					class: 'manipulator-button',
					innerHTML: panZoomSVG,
					events: {
						click: () => {
							this.#manipulator.setMode(ManipulatorMode.Scale);
							htmlManipulator.checked = true;
							this.#manipulator.setVisible(true);
						},
					}
				}),
			],
		});


		createElement('label', {
			parent: this.#htmlHeader,
			childs: [
				createElement('input', {
					type: 'checkbox',
					events: {
						change: (event: Event) => {
							const checked = (event.target as HTMLInputElement).checked;
							this.#skeletonHelper.setVisible(checked);
							display(this.#htmlDisplayBoneJoints, checked);
							display(this.#htmlDisplayBoneAsLines, checked);
						}
					}
				}),
				createElement('span', {
					i18n: '#display_skeleton',
				}),
			]
		});

		this.#htmlDisplayBoneJoints = createElement('label', {
			parent: this.#htmlHeader,
			hidden: true,
			childs: [
				createElement('input', {
					type: 'checkbox',
					checked: true,
					events: {
						change: (event: Event) => this.#skeletonHelper.displayBoneJoints((event.target as HTMLInputElement).checked)
					}
				}),
				createElement('span', {
					i18n: '#display_bone_joints',
				}),
			]
		});

		this.#htmlDisplayBoneAsLines = createElement('label', {
			parent: this.#htmlHeader,
			hidden: true,
			childs: [
				createElement('input', {
					type: 'checkbox',
					events: {
						change: (event: Event) => SkeletonHelper.displayBonesAsLines((event.target as HTMLInputElement).checked)
					}
				}),
				createElement('span', {
					i18n: '#display_bones_as_lines',
				}),
			]
		});

		/*
		let propertiesId = 'display_properties';
		let htmlDisplayProperties = createElement('input') as HTMLInputElement;
		htmlDisplayProperties.type = 'checkbox';
		htmlDisplayProperties.id = propertiesId;
		htmlDisplayProperties.checked = false;

		/*
		let htmlDisplayPropertiesSpan = createElement('span');
		let htmlDisplayPropertiesLabel = createElement('label', { i18n: '#display_properties', htmlFor: propertiesId });

		this.#htmlHeader.append(htmlDisplayPropertiesSpan);
		htmlDisplayPropertiesSpan.append(htmlDisplayProperties, htmlDisplayPropertiesLabel);
		*/

		this.#htmlNameFilter.addEventListener('change', (event) => { this.#filterName = (event.target as HTMLInputElement).value.toLowerCase(); this.#applyFilter(); });
		this.#htmlTypeFilter.addEventListener('change', (event) => { this.#filterType = (event.target as HTMLInputElement).value; this.#applyFilter(); });
		//htmlDisplayProperties.addEventListener('change', (event) => toggle(this.#htmlProperties));

		this.#populateTypeFilter();
	}

	#populateTypeFilter(): void {
		for (const type of ENTITIES) {
			const option = createElement('option', { innerText: type, value: type });
			this.#htmlTypeFilter.append(option);
		}
	}

	#applyFilter(): void {
		if (this.#isVisible) {
			SceneExplorerEntity.showAll();
			if (this.#filterName == '' && this.#filterType == '') {
				this.#refreshScene();
			} else {
				const filteredEntities = new Set<Entity>();

				const addEntity = (entity: Entity): void => {
					if (!filteredEntities.has(entity)) { // Prevent a potential recursion loop
						filteredEntities.add(entity);
						if (entity.parent) {
							addEntity(entity.parent);
						}
					}
				}

				if (this.#scene) {
					const allEntities = this.#scene.getChildList();
					this.#htmlScene.innerText = '';
					for (const entity of allEntities) {
						if (this.#matchFilter(entity, this.#filterName, this.#filterType)) {
							addEntity(entity);
						}
					}

					this.#refreshScene(filteredEntities);
				}
			}
		}
	}

	#matchFilter(entity: Entity, name: string, type: string): boolean {
		return (name ? entity.name.toLowerCase().includes(name) : true) && (type ? entity.is(type) : true);
	}

	#initHtmlProperties(): void {
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
		/*
		const htmlVisibleLabel = createElement('label', { i18n: '#visible' });
		this.#htmlVisible = createElement('input', {
			class: 'scene-explorer-entity-visible',
			type: 'checkbox',
			events: {
				input: () => this.#selectedEntity?.toggleVisibility?.()
			}
		}) as HTMLInputElement;
		*/
		//this.htmlVisible.addEventListener('input', () => {if (this._currentEntity) this._currentEntity.toggleVisibility()});
		this.#htmlProperties.append(this.#htmlName, htmlIdLabel, this.#htmlId, htmlPosLabel, this.#htmlPos, htmlQuatLabel, this.#htmlQuat, htmlScaleLabel, this.#htmlScale, htmlWorldPosLabel, this.#htmlWorldPos, htmlWorldQuatLabel, this.#htmlWorldQuat, htmlWorldScaleLabel, this.#htmlWorldScale/*, htmlVisibleLabel, this.#htmlVisible*/);
	}

	#createEntityElement(entity: Entity, createExpanded: boolean, visibleEntities?: Set<Entity>): SceneExplorerEntity | null {
		const htmlEntityElement = SceneExplorerEntity.getEntityElement(entity);

		if (createExpanded) {
			htmlEntityElement?.expand(visibleEntities);
		}
		return htmlEntityElement;
	}

	selectEntity(entity: Entity | null, scrollIntoView = false): void {
		if (this.#selectedEntity == entity || entity == this.#manipulator || (entity && entity?.isParent(this.#manipulator))) {
			return;
		}

		this.#selectedEntity = entity;
		entity?.addChild(this.#manipulator);
		entity?.addChild(this.#skeletonHelper);
		if (this.#isVisible) {
			this.#updateEntityElement(entity);
			if (entity) {
				SceneExplorerEntity.getEntityElement(entity)?.select();

				if (scrollIntoView) {
					SceneExplorerEntity.getEntityElement(entity)?.display();
				}
			}
		}
	}

	getSelectedEntity(): Entity | null {
		return this.#selectedEntity;
	}

	#updateEntityElement(entity: Entity | null): void {
		if (entity) {
			//this.#updateEntityTitle(entity);
			this.#htmlName.innerText = entity.name ?? (entity.constructor as typeof Entity).getEntityName();
			this.#htmlId.innerText = entity.id;
			this.#htmlPos.innerText = FormatArray(entity.getPosition());
			this.#htmlQuat.innerText = FormatArray(entity.getOrientation());
			this.#htmlScale.innerText = FormatArray(entity.getScale());
			this.#htmlWorldPos.innerText = FormatArray(entity.getWorldPosition());
			this.#htmlWorldQuat.innerText = FormatArray(entity.getWorldOrientation());
			this.#htmlWorldScale.innerText = FormatArray(entity.getWorldScale());
			//this.#htmlVisible.checked = entity.visible;
			/*
			if (entity.visibleSelf === undefined) {
				this.#htmlVisible.indeterminate = true;
			} else {
				this.#htmlVisible.indeterminate = false;
			}
			*/
		}
	}

	#handlePropertyChanged(detail: EntityObserverPropertyChangedEvent): void {
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

	showContextMenu(contextMenu: HarmonyMenuItems, x: number, y: number, entity: Entity): void {
		this.#htmlContextMenu.showContextual(contextMenu, x, y, entity);
		this.selectEntity(entity);
	}

	editMaterial(material: Material): void {
		const materialEditor = getMaterialEditor();
		materialEditor.editMaterial(material);

		this.#htmlMaterialEditor.append(materialEditor.getHTML());

		this.#htmlExtra.expand('material');
	}

	setJointsRadius(radius: number): void {
		this.#skeletonHelper.setJointsRadius(radius);
	}
}

function initEntitySubmenu(): void {
	Entity.addSubMenu = [
		{
			i18n: '#primitives', submenu:
				[
					{ i18n: '#box', f: (entity: Entity): void => { entity.addChild(new Box()) } },
					{ i18n: '#cone', f: (entity: Entity): void => { entity.addChild(new Cone()) } },
					{ i18n: '#cylinder', f: (entity: Entity): void => { entity.addChild(new Cylinder()) } },
					{ i18n: '#fullscreenquad', f: (entity: Entity): void => { entity.addChild(new FullScreenQuad()) } },
					{ i18n: '#metaballs', f: (entity: Entity): void => { entity.addChild(new Metaballs()) } },
					{ i18n: '#plane', f: (entity: Entity): void => { entity.addChild(new Plane({ width: 1000, height: 1000 })) } },
					{ i18n: '#sphere', f: (entity: Entity): void => { entity.addChild(new Sphere()) } },
					{ i18n: '#text_2d', f: (entity: Entity): void => { entity.addChild(new Text2D({ text: 'Text2D' })) } },
					{ i18n: '#text_3d', f: (entity: Entity): void => { entity.addChild(new Text3D({ text: 'Text3D' })) } },
				]
		},
		{
			i18n: '#entities', submenu:
				[
					{ i18n: '#group', f: (entity: Entity): void => { entity.addChild(new Group()) } },
					{ i18n: '#target', f: (entity: Entity): void => { entity.addChild(new Target()) } },
					{ i18n: '#keeponlylastchild', f: (entity: Entity): void => { entity.addChild(new KeepOnlyLastChild()) } },
					{ i18n: '#decal', f: (entity: Entity): void => { entity.addChild(new Decal()) } },
				]
		},
		{
			i18n: '#lights', submenu:
				[
					{ i18n: '#ambient_light', f: (entity: Entity): void => { entity.addChild(new AmbientLight()) } },
					{ i18n: '#point_light', f: (entity: Entity): void => { entity.addChild(new PointLight()) } },
					{ i18n: '#spot_light', f: (entity: Entity): void => { entity.addChild(new SpotLight()) } },
				]
		},
		{ i18n: '#camera', f: (entity: Entity): void => { entity.addChild(new Camera()) } },
		{
			i18n: '#control', submenu:
				[
					{
						i18n: '#rotation_control', f: (entity: Entity): void => { new RotationControl({ parent: entity }) },
					},
					{
						i18n: '#translation_control', f: (entity: Entity): void => { new TranslationControl({ parent: entity }) },
					},
				]
		},
		{ i18n: '#helper', f: (entity: Entity): void => { const helper = getHelper(entity); if (helper) { entity.addChild(helper); }; } },
		{ i18n: '#wireframe', f: (entity: Entity): void => { entity.addChild(new WireframeHelper()) } },
		{ i18n: '#wireframe2', f: (entity: Entity): void => { entity.addChild(new Wireframe()) } },
		{ i18n: '#hitboxes', f: (entity: Entity): void => { entity.addChild(new HitboxHelper()) } },
		{
			i18n: '#source1', submenu:
				[
					{
						i18n: '#model', f: async (entity: Entity): Promise<void> => {
							show(new SceneExplorer().htmlFileSelector);
							// eslint-disable-next-line @typescript-eslint/no-misused-promises
							Interaction.selectFile(new SceneExplorer().htmlFileSelector, await Source1ModelManager.getModelList(), async (repository, modelName) => {
								console.error(modelName);
								//let instance = await Source1ModelManager.createInstance(modelName.repository, modelName.path + modelName.name, true);
								const instance = await Source1ModelManager.createInstance(repository, modelName, true);
								if (!instance) {
									return;
								}
								(new SceneExplorer().getSelectedEntity() ?? entity).addChild(instance);
								const seq = instance.sourceModel.mdl.getSequenceById(0);
								if (seq) {
									instance.playSequence(seq.name);
								}
							});
						}
					},
					{
						i18n: '#particle_system', f: async (entity: Entity): Promise<void> => {
							show(new SceneExplorer().htmlFileSelector);
							// eslint-disable-next-line @typescript-eslint/no-misused-promises
							Interaction.selectFile(new SceneExplorer().htmlFileSelector, await Source1ParticleControler.getSystemList(), async (repository, systemPath) => {
								const systemName = systemPath.split('/');
								const sys = await Source1ParticleControler.createSystem(repository, systemName[systemName.length - 1]!);
								sys.start();
								(new SceneExplorer().getSelectedEntity() ?? entity).addChild(sys);
							});
						}
					},
				]
		},
		{
			i18n: '#source2', submenu:
				[
					{
						i18n: '#model', f: async (entity: Entity): Promise<void> => {
							show(new SceneExplorer().htmlFileSelector);
							// eslint-disable-next-line @typescript-eslint/no-misused-promises
							Interaction.selectFile(new SceneExplorer().htmlFileSelector, await Source2ModelManager.getModelList(), async (repository, modelName) => {
								console.error(modelName);
								const instance = await Source2ModelManager.createInstance(repository, modelName, true);
								(new SceneExplorer().getSelectedEntity() ?? entity).addChild(instance);
								/*let seq = instance.sourceModel.mdl.getSequenceById(0);
								if (seq) {
									instance.playSequence(seq.name);
								}*/
							});
						}
					},
					{
						i18n: '#particle_system', f: async (entity: Entity): Promise<void> => {
							show(new SceneExplorer().htmlFileSelector);
							// eslint-disable-next-line @typescript-eslint/no-misused-promises
							Interaction.selectFile(new SceneExplorer().htmlFileSelector, await Source2ParticleManager.getSystemList(), async (repository, systemPath) => {
								const systemName = systemPath.split('/');
								const sys = await Source2ParticleManager.getSystem(repository, systemPath);
								if (sys) {
									sys.name = systemName[systemName.length - 1]!;
									sys.start();
									(new SceneExplorer().getSelectedEntity() ?? entity).addChild(sys);
								}
							});
						}
					},
				]
		},
	];
}

Entity.editMaterial = function (entity): void {
	const material = (entity as any).material;

	if (!material) {
		return;
	}

	const sceneExplorer = getSceneExplorer();
	sceneExplorer.editMaterial(material);
	//materialEditor.editEntity(entity);

	//this.#htmlMaterialEditor.append(materialEditor.getHTML());
	/*
	let entityHtml = SceneExplorer.getEntityHtml(entity);
	if (entityHtml) {
		entityHtml.append(MaterialEditor.html);
	}
		*/
}
