import { lockOpenRightSVG, lockSVG, pauseSVG, playSVG, repeatOnSVG, repeatSVG, restartSVG, runSVG, visibilityOffSVG, visibilityOnSVG, walkSVG } from 'harmony-svg';
import { createElement, defineHarmonyToggleButton, display, hide, HTMLHarmonyToggleButtonElement, show, toggle } from 'harmony-ui';
import '../css/sceneexplorerentity.css';
import { Entity } from '../entities/entity';
import { CHILD_ADDED, CHILD_REMOVED, ENTITY_DELETED, EntityObserver, PROPERTY_CHANGED } from '../entities/entityobserver';
import { Animated } from '../interfaces/animated';
import { Lockable } from '../interfaces/lockable';
import { Loopable } from '../interfaces/loopable';
import { SceneExplorer } from './sceneexplorer';

const MAX_ANIMATIONS = 2;

let dataListId = 0;
function getDataListId() {
	return `animations-datalist${++dataListId}`;
}

export class SceneExplorerEntity extends HTMLElement {
	#doOnce;
	#entity?: Entity;
	#htmlHeader;
	#htmlContent: HTMLElement;
	#htmlAnimations?: HTMLElement;
	#htmlInputDataList?: HTMLDataListElement;
	#htmlChilds;
	#htmlTitle;
	#htmlVisible;
	#htmlPlaying;
	#htmlAnimationsButton?: HTMLHarmonyToggleButtonElement;
	#htmlLoopedButton?: HTMLHarmonyToggleButtonElement;
	#htmlLockedButton?: HTMLHarmonyToggleButtonElement;
	#htmlReset;

	static #entitiesHTML = new Map<Entity, SceneExplorerEntity>();
	static #selectedEntity?: SceneExplorerEntity;
	static #explorer?: SceneExplorer;
	static #draggedEntity?: Entity;

	static {
		EntityObserver.addEventListener(CHILD_ADDED, (event: Event) => SceneExplorerEntity.#expandEntityChilds((event as CustomEvent).detail.parent));
		EntityObserver.addEventListener(CHILD_REMOVED, (event: Event) => SceneExplorerEntity.#expandEntityChilds((event as CustomEvent).detail.parent));
		EntityObserver.addEventListener(PROPERTY_CHANGED, (event: Event) => SceneExplorerEntity.#handlePropertyChanged((event as CustomEvent).detail));
		EntityObserver.addEventListener(ENTITY_DELETED, (event: Event) => SceneExplorerEntity.#handleEntityDeleted((event as CustomEvent).detail));
	}

	constructor() {
		super();
		this.#doOnce = true;
		defineHarmonyToggleButton();
		this.#htmlHeader = createElement('div', {
			class: 'scene-explorer-entity-header',
			childs: [
				this.#htmlTitle = createElement('div', {
					class: 'scene-explorer-entity-title',
					events: {
						click: () => this.#titleClick(),
					}
				}),
				createElement('div', {
					class: 'scene-explorer-entity-buttons',
					childs: [
						this.#htmlVisible = createElement('div', {
							class: 'scene-explorer-entity-button-visible',
							events: {
								click: () => {
									this.#entity?.toggleVisibility();
								},
							}
						}),
						this.#htmlPlaying = createElement('div', {
							hidden: true,
							class: 'scene-explorer-entity-button-play',
							events: {
								click: () => {
									this.#entity?.togglePlaying();
								},
							}
						}),
						this.#htmlAnimationsButton = createElement('harmony-toggle-button', {
							hidden: true,
							childs: [
								createElement('div', {
									slot: 'off',
									innerHTML: runSVG,
								}),
								createElement('div', {
									slot: 'on',
									innerHTML: walkSVG,
								}),
							],
							events: {
								change: (event: Event) => this.#displayAnimations((event.target as HTMLHarmonyToggleButtonElement).state),
							}
						}) as HTMLHarmonyToggleButtonElement,
						this.#htmlLoopedButton = createElement('harmony-toggle-button', {
							hidden: true,
							childs: [
								createElement('div', {
									slot: 'off',
									innerHTML: repeatSVG,
								}),
								createElement('div', {
									slot: 'on',
									innerHTML: repeatOnSVG,
								}),
							],
							events: {
								change: (event: Event) => (this.#entity as unknown as Loopable)?.setLooping((event.target as HTMLHarmonyToggleButtonElement).state),
							}
						}) as HTMLHarmonyToggleButtonElement,
						this.#htmlLockedButton = createElement('harmony-toggle-button', {
							hidden: true,
							childs: [
								createElement('div', {
									slot: 'off',
									innerHTML: lockOpenRightSVG,
								}),
								createElement('div', {
									slot: 'on',
									innerHTML: lockSVG,
								}),
							],
							events: {
								change: (event: Event) => (this.#entity as unknown as Lockable)?.setLocked((event.target as HTMLHarmonyToggleButtonElement).state),
							}
						}) as HTMLHarmonyToggleButtonElement,
						this.#htmlReset = createElement('div', {
							hidden: true,
							class: 'scene-explorer-entity-button-reset',
							innerHTML: restartSVG,
							events: {
								click: () => {
									this.#entity?.do('reset');
								},
							}
						}),
					]
				}),
			]
		});
		this.#htmlContent = createElement('div', {
			class: 'scene-explorer-entity-content',
			hidden: true,
		});
		this.#htmlChilds = createElement('div', {
			class: 'scene-explorer-entity-childs',
			hidden: true,
		});
	}

	connectedCallback() {
		if (this.#doOnce) {
			this.#doOnce = false;
			this.#htmlHeader.draggable = true;
			this.append(this.#htmlHeader, this.#htmlContent, this.#htmlChilds);
			this.addEventListener('contextmenu', event => this.#contextMenuHandler(event));
			this.addEventListener('dragstart', event => {
				if (event.dataTransfer) {
					event.dataTransfer.effectAllowed = 'link';
				}
				SceneExplorerEntity.#draggedEntity = this.#entity;
				event.stopPropagation();
			});
			this.addEventListener('dragenter', event => {
				this.classList.add('dragged-over');
			});
			this.addEventListener('dragleave', event => {
				this.classList.remove('dragged-over');
			});
			this.addEventListener('dragover', event => {
				event.preventDefault();
				event.stopPropagation();
			});
			this.addEventListener('drop', event => {
				const draggedEntity = SceneExplorerEntity.#draggedEntity;
				if (draggedEntity) {
					this.classList.remove('dragged-over');
					this.#entity?.addChild(draggedEntity);
					event.stopPropagation();
				}
			});
			this.addEventListener('dragend', () => {
				SceneExplorerEntity.#draggedEntity = undefined;
			});
		}
	}

	/**
	 * @deprecated Please use `setEntity` instead.
	 */
	set entity(entity: Entity) {
		//TODO: deprecate
		console.warn('deprecated, use setEntity instaed');
		this.setEntity(entity);

	}

	setEntity(entity: Entity) {
		this.#entity = entity;
		this.#update();
		this.#updateVisibility();
		this.#updatePlaying();
		display(this.#htmlPlaying, entity?.animable);
		display(this.#htmlAnimationsButton, (entity as unknown as Animated)?.hasAnimations);
		display(this.#htmlReset, entity?.resetable);
		display(this.#htmlLoopedButton, (entity as unknown as Loopable)?.isLoopable);
		display(this.#htmlLockedButton, (entity as unknown as Lockable)?.isLockable);
	}

	static setExplorer(explorer: SceneExplorer) {
		SceneExplorerEntity.#explorer = explorer;
	}

	/*
	static get selectedEntity() {
		return SceneExplorerEntity.#selectedEntity.#entity;
	}
	*/

	select() {
		this.classList.add('selected');
		const selectedEntity = SceneExplorerEntity.#selectedEntity;
		if (selectedEntity != this) {
			selectedEntity?.unselect();
		}

		SceneExplorerEntity.#selectedEntity = this;
	}

	display() {
		this.#display();

		this.scrollIntoView();
	}

	#display() {
		const parentEntity = this.#entity.parent;
		if (parentEntity) {
			const htmlParent = SceneExplorerEntity.getEntityElement(parentEntity);
			if (htmlParent) {
				htmlParent.#display();
				htmlParent.expand();
			}
		}
	}

	unselect() {
		this.classList.remove('selected');
	}

	static getEntityElement(entity: Entity) {
		if (entity.hideInExplorer) {
			return null;
		}

		let entityElement: SceneExplorerEntity = SceneExplorerEntity.#entitiesHTML.get(entity);
		if (!entityElement) {
			entityElement = createElement('scene-explorer-entity') as SceneExplorerEntity;
			entityElement.setEntity(entity);
			SceneExplorerEntity.#entitiesHTML.set(entity, entityElement);
		}

		return entityElement;
	}

	static #handlePropertyChanged(detail: any) {
		const entity = detail.entity;
		SceneExplorerEntity.#updateEntity(entity);
		let entityElement;
		switch (detail.name) {
			case 'visible':
				this.#updateEntityVisibility(entity);
				for (const child of entity.children) {
					this.#updateEntityVisibility(child);
				}
				break;
			case 'playing':
				this.#updateEntityPlaying(entity);
				break;
		}
	}

	static #handleEntityDeleted(detail: any) {
		SceneExplorerEntity.#entitiesHTML.delete(detail.entity);
		//console.log('deleted entity', detail.entity);
	}

	static #updateEntity(entity: any) {
		const entityElement = SceneExplorerEntity.#entitiesHTML.get(entity);
		if (entityElement) {
			entityElement.#update();
		}
	}

	static #expandEntityChilds(entity: Entity) {
		const entityElement = SceneExplorerEntity.#entitiesHTML.get(entity);
		if (entityElement) {
			entityElement.#expandChilds();
		}
	}

	#update() {
		const entity = this.#entity;
		if (entity) {
			const className = (entity.constructor as typeof Entity).getEntityName();
			this.#htmlTitle.innerText = entity.name ? `${entity.name} (${className})` : className;
		}
	}

	static #updateEntityVisibility(entity: Entity) {
		const entityElement = SceneExplorerEntity.#entitiesHTML.get(entity);
		if (entityElement) {
			entityElement.#updateVisibility();
		}
	}

	#updateVisibility() {
		if (this.#entity?.isVisible()) {
			this.#htmlVisible.innerHTML = visibilityOnSVG;
		} else {
			this.#htmlVisible.innerHTML = visibilityOffSVG;
		}
	}

	static #updateEntityPlaying(entity: Entity) {
		const entityElement = SceneExplorerEntity.#entitiesHTML.get(entity);
		if (entityElement) {
			entityElement.#updatePlaying();
		}
	}

	#updatePlaying() {
		if (this.#entity?.isPlaying()) {
			this.#htmlPlaying.innerHTML = playSVG;
		} else {
			this.#htmlPlaying.innerHTML = pauseSVG;
		}
	}

	expand() {
		show(this.#htmlChilds);
		this.#expandChilds();
		//this.select();
	}

	#expandChilds() {
		this.#htmlChilds.innerText = '';
		const entity = this.#entity;

		if (!entity) {
			return;
		}

		for (const child of entity.children) {
			const childHtml = SceneExplorerEntity.getEntityElement(child);
			if (childHtml) {
				this.#htmlChilds.append(childHtml);
			}
		}
	}

	#titleClick() {
		if (this == SceneExplorerEntity.#selectedEntity) {
			toggle(this.#htmlChilds);
		} else {
			show(this.#htmlChilds);
		}
		this.#expandChilds();
		SceneExplorerEntity.#explorer?.selectEntity(this.#entity);
	}

	#contextMenuHandler(event: MouseEvent) {
		if (!event.shiftKey && this.#entity) {
			SceneExplorerEntity.#explorer?.showContextMenu(this.#entity.buildContextMenu(), event.clientX, event.clientY, this.#entity);
			event.preventDefault();
			event.stopPropagation();
		}
	}

	async #displayAnimations(display: boolean) {
		if (!this.#entity) {
			return;
		}

		if (this.#htmlAnimations && !display) {
			hide(this.#htmlAnimations);
			return;
		}

		this.#initAnimations();
		//SceneExplorerEntity.#explorer?.showAnimations(this.#entity);

		const animList = await (this.#entity as unknown as Animated).getAnimations?.();
		if (!animList) {
			return;
		}

		(this.#htmlInputDataList as HTMLDataListElement).innerText = '';
		for (const value of animList) {
			createElement('option', {
				innerText: value as string,
				parent: this.#htmlInputDataList,
			});
		}

		show(this.#htmlAnimations);
		show(this.#htmlContent);
	}

	#initAnimations() {
		if (this.#htmlAnimations) {
			return;
		}

		this.#htmlAnimations = createElement('div', {
			class: 'animations',
			parent: this.#htmlContent,
		});


		const dataListId = getDataListId();

		for (let i = 0; i < MAX_ANIMATIONS; i++) {
			createElement('div', {
				class: 'animation',
				parent: this.#htmlAnimations,
				childs: [
					createElement('input', {
						list: dataListId,
						events: {
							change: (event: Event) => this.#setAnimName(i, (event.target as HTMLInputElement).value)
						}
					}),
				],
			});
		}

		this.#htmlInputDataList = createElement('datalist', {
			id: dataListId,
			parent: this.#htmlAnimations,
		}) as HTMLDataListElement;
	}

	#setAnimName(id: number, name: string) {
		if (!this.#entity) {
			return;
		}

		(this.#entity as unknown as Animated).playAnimation(name);
		(this.#entity as unknown as Animated).setAnimation(id, name, 1);//TODO: weight
	}
}

if (window.customElements) {
	customElements.define('scene-explorer-entity', SceneExplorerEntity);
}
