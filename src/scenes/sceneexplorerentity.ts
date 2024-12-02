import { createElement, display, show, toggle } from 'harmony-ui';
import { pauseSVG, playSVG, restartSVG, visibilityOffSVG, visibilityOnSVG } from 'harmony-svg';

import { EntityObserver, CHILD_ADDED, CHILD_REMOVED, PROPERTY_CHANGED, ENTITY_DELETED } from '../entities/entityobserver';

import '../css/sceneexplorerentity.css';
import { Entity } from '../entities/entity';
import { SceneExplorer } from './sceneexplorer';

export class SceneExplorerEntity extends HTMLElement {
	#doOnce;
	#entity?: Entity;
	#htmlHeader;
	#htmlChilds;
	#htmlTitle;
	#htmlVisible;
	#htmlPlaying;
	#htmlReset;

	static #entitiesHTML = new Map();
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
		this.#htmlChilds = createElement('div', {
			class: 'scene-explorer-entity-childs',
			hidden: true,
		});
	}

	connectedCallback() {
		if (this.#doOnce) {
			this.#doOnce = false;
			this.draggable = true;
			this.append(this.#htmlHeader, this.#htmlChilds);
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
		display(this.#htmlReset, entity?.resetable);
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
			SceneExplorerEntity.#explorer?.selectEntity(this.#entity);
		}

		SceneExplorerEntity.#selectedEntity = this;
	}

	unselect() {
		this.classList.remove('selected');
	}

	static getEntityElement(entity: Entity) {
		if (entity.hideInExplorer) {
			return null;
		}

		let entityElement = SceneExplorerEntity.#entitiesHTML.get(entity);
		if (!entityElement) {
			entityElement = createElement('scene-explorer-entity');
			entityElement.entity = entity;
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
				for (let child of entity.children) {
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
		let entityElement = SceneExplorerEntity.#entitiesHTML.get(entity);
		if (entityElement) {
			entityElement.#update();
		}
	}

	static #expandEntityChilds(entity: Entity) {
		let entityElement = SceneExplorerEntity.#entitiesHTML.get(entity);
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
		if (this.#entity?.visible) {
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
		this.select();
	}

	#expandChilds() {
		this.#htmlChilds.innerText = '';
		const entity = this.#entity;

		if (!entity) {
			return;
		}

		for (let child of entity.children) {
			const childHtml = SceneExplorerEntity.getEntityElement(child);
			if (childHtml) {
				this.#htmlChilds.append(childHtml);
			}
		}
	}

	#titleClick() {
		toggle(this.#htmlChilds);
		this.#expandChilds();
		this.select();
	}

	#contextMenuHandler(event: MouseEvent) {
		if (!event.shiftKey && this.#entity) {
			SceneExplorerEntity.#explorer?.htmlContextMenu.show(this.#entity.buildContextMenu(), event.clientX, event.clientY, this.#entity);
			event.preventDefault();
			event.stopPropagation();
		}
	}
}

if (window.customElements) {
	customElements.define('scene-explorer-entity', SceneExplorerEntity);
}
