import { ShortcutHandler } from 'harmony-browser-utils';
import { lightbulbSVG, lightOffSVG, lockOpenRightSVG, lockSVG, paletteSVG, pauseSVG, playSVG, repeatOnSVG, repeatSVG, restartSVG, runCircleSVG, runSVG, targetSVG, visibilityOffSVG, visibilityOnSVG } from 'harmony-svg';
import { createElement, defineHarmonyToggleButton, display, hide, HTMLHarmonyToggleButtonElement, show, toggle } from 'harmony-ui';
import { RetargetControl } from '../controls/retargetcontrol';
import '../css/sceneexplorerentity.css';
import { Entity } from '../entities/entity';
import { EntityObserver, EntityObserverChildAddedEvent, EntityObserverChildRemovedEvent, EntityObserverEvent, EntityObserverEventType, EntityObserverPropertyChangedEvent } from '../entities/entityobserver';
import { Animated } from '../interfaces/animated';
import { HasSkeleton } from '../interfaces/hasskeleton';
import { Lockable } from '../interfaces/lockable';
import { Loopable } from '../interfaces/loopable';
import { Tintable } from '../interfaces/tintable';
import { Light } from '../lights/light';
import { Interaction } from '../utils/interaction';
import { SceneExplorer } from './sceneexplorer';

const MAX_ANIMATIONS = 3;

let dataListId = 0;
function getDataListId(): string {
	return `animations-datalist${++dataListId}`;
}

export class SceneExplorerEntity extends HTMLElement {
	#doOnce;
	#entity: Entity | null = null;
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
	#htmlTint: HTMLElement;
	#htmlTarget: HTMLElement;
	#indentation = 0;

	static #entitiesHTML = new Map<Entity, SceneExplorerEntity>();
	static #selectedEntity?: SceneExplorerEntity;
	static #explorer?: SceneExplorer;
	static #draggedEntity: Entity | null = null;
	static picking = false;

	static {
		EntityObserver.addEventListener(EntityObserverEventType.ChildAdded, (event: CustomEvent<EntityObserverEvent>) => SceneExplorerEntity.#expandEntityChilds((event as CustomEvent<EntityObserverChildAddedEvent>).detail.parent));
		EntityObserver.addEventListener(EntityObserverEventType.ChildRemoved, (event: CustomEvent<EntityObserverEvent>) => SceneExplorerEntity.#expandEntityChilds((event as CustomEvent<EntityObserverChildRemovedEvent>).detail.parent));
		EntityObserver.addEventListener(EntityObserverEventType.PropertyChanged, (event: CustomEvent<EntityObserverEvent>) => SceneExplorerEntity.#handlePropertyChanged((event as CustomEvent).detail));
		EntityObserver.addEventListener(EntityObserverEventType.EntityDeleted, (event: CustomEvent<EntityObserverEvent>) => SceneExplorerEntity.#handleEntityDeleted((event as CustomEvent).detail));
	}

	constructor() {
		super();
		this.#doOnce = true;
		defineHarmonyToggleButton();
		this.#htmlHeader = createElement('div', {
			class: 'scene-explorer-entity-header',
			childs: [
				this.#htmlVisible = createElement('div', {
					class: 'scene-explorer-entity-button-visible',
					events: {
						click: () => {
							this.#entity?.toggleVisibility();
						},
					}
				}),
				this.#htmlTitle = createElement('div', {
					class: 'scene-explorer-entity-title',
					events: {
						click: () => this.#titleClick(),
					}
				}),
				createElement('div', {
					class: 'scene-explorer-entity-buttons',
					childs: [
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
									innerHTML: runCircleSVG,
								}),
							],
							events: {
								// eslint-disable-next-line @typescript-eslint/no-misused-promises
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
								change: (event: Event) => {
									if (this.#entity) {
										(this.#entity as unknown as Lockable).locked = (event.target as HTMLHarmonyToggleButtonElement).state;
									}
								},
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
						this.#htmlTint = createElement('div', {
							hidden: true,
							class: 'scene-explorer-entity-button-tint',
							innerHTML: paletteSVG,
							events: {
								click: () => {
									if ((this.#entity as unknown as Tintable).isTintable) {
										const initialTint = (this.#entity as unknown as Tintable).getTint();
										Interaction.getColor(0, 0, initialTint,
											(tint) => { (this.#entity as unknown as Tintable).setTint(tint); },
											() => { (this.#entity as unknown as Tintable).setTint(initialTint); });
									}
								},
							}
						}),
						this.#htmlTarget = createElement('div', {
							hidden: true,
							class: 'scene-explorer-entity-button-target',
							innerHTML: targetSVG,
							// eslint-disable-next-line @typescript-eslint/no-misused-promises
							$click: async () => {
								if ((this.#entity as unknown as HasSkeleton).hasSkeleton) {
									const sourceEntity = await SceneExplorerEntity.#explorer?.pickEntity({
										match: (ent: Entity): boolean => {
											return ent !== this.#entity && !ent.isParent(this.#entity!) && (ent as unknown as HasSkeleton).hasSkeleton === true;
										}
									});

									if ((sourceEntity as unknown as HasSkeleton).hasSkeleton) {
										(this.#entity as unknown as HasSkeleton).skeleton!.addChild(new RetargetControl({ source: (sourceEntity as unknown as HasSkeleton).skeleton! }));
										this.#entity?.setPlaying(false);
									}
								}
							},
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

	connectedCallback(): void {
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
			this.addEventListener('dragenter', () => {
				this.classList.add('dragged-over');
			});
			this.addEventListener('dragleave', () => {
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
				SceneExplorerEntity.#draggedEntity = null;
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

	setEntity(entity: Entity): void {
		this.#entity = entity;
		this.#update();
		this.#updateVisibility();
		this.#updatePlaying();
		display(this.#htmlPlaying, entity?.animable);
		display(this.#htmlAnimationsButton, (entity as unknown as Animated)?.hasAnimations);
		display(this.#htmlReset, entity?.resetable);
		display(this.#htmlLoopedButton, (entity as unknown as Loopable)?.isLoopable);
		display(this.#htmlLockedButton, (entity as unknown as Lockable)?.isLockable);
		display(this.#htmlTint, (this.#entity as unknown as Tintable)?.isTintable);
		display(this.#htmlTarget, (this.#entity as unknown as HasSkeleton)?.hasSkeleton);
	}

	static setExplorer(explorer: SceneExplorer): void {
		SceneExplorerEntity.#explorer = explorer;
	}

	/*
	static get selectedEntity() {
		return SceneExplorerEntity.#selectedEntity.#entity;
	}
	*/

	select(addToSelection = false): void {
		this.classList.add('selected');
		const selectedEntity = SceneExplorerEntity.#selectedEntity;
		if (selectedEntity != this && !addToSelection) {
			selectedEntity?.unselect();
		}

		SceneExplorerEntity.#selectedEntity = this;
	}

	display(): void {
		this.#display();

		this.scrollIntoView();
	}

	#display(): void {
		const parentEntity = this.#entity?.parent;
		if (parentEntity) {
			const htmlParent = SceneExplorerEntity.getEntityElement(parentEntity);
			if (htmlParent) {
				htmlParent.#display();
				htmlParent.expand();
			}
		}
	}

	unselect(): void {
		this.classList.remove('selected');
	}

	static getEntityElement(entity: Entity): SceneExplorerEntity | null {
		if (entity.hideInExplorer) {
			return null;
		}

		let entityElement: SceneExplorerEntity | undefined = SceneExplorerEntity.#entitiesHTML.get(entity);
		if (!entityElement) {
			entityElement = createElement('scene-explorer-entity') as SceneExplorerEntity;
			entityElement.setEntity(entity);
			SceneExplorerEntity.#entitiesHTML.set(entity, entityElement);
		} else {
			// Ensure a previously filtered element is shown
			show(entityElement);
		}

		return entityElement;
	}

	static #handlePropertyChanged(detail: EntityObserverPropertyChangedEvent): void {
		const entity = detail.entity;
		SceneExplorerEntity.#updateEntity(entity);
		//let entityElement;
		switch (detail.propertyName) {
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

	static #handleEntityDeleted(detail: any): void {
		SceneExplorerEntity.#entitiesHTML.delete(detail.entity);
		//console.log('deleted entity', detail.entity);
	}

	static #updateEntity(entity: any): void {
		const entityElement = SceneExplorerEntity.#entitiesHTML.get(entity);
		if (entityElement) {
			entityElement.#update();
		}
	}

	static #expandEntityChilds(entity: Entity): void {
		const entityElement = SceneExplorerEntity.#entitiesHTML.get(entity);
		if (entityElement) {
			entityElement.#expandChilds();
		}
	}

	#update(): void {
		const entity = this.#entity;
		if (entity) {
			const className = (entity.constructor as typeof Entity).getEntityName();
			this.#htmlTitle.innerText = entity.name ? `${entity.name} (${className})` : className;
		}
	}

	static #updateEntityVisibility(entity: Entity): void {
		const entityElement = SceneExplorerEntity.#entitiesHTML.get(entity);
		if (entityElement) {
			entityElement.#updateVisibility();
		}
	}

	static showAll(): void {
		for (const [, a] of SceneExplorerEntity.#entitiesHTML) {
			show(a);
		}
	}

	static hideAll(): void {
		for (const [, a] of SceneExplorerEntity.#entitiesHTML) {
			hide(a);
		}
	}

	#updateVisibility(): void {
		let on = visibilityOnSVG;
		let off = visibilityOffSVG;
		if ((this.#entity as Light).isLight) {
			on = lightbulbSVG;
			off = lightOffSVG;
		}
		if (this.#entity?.isVisible()) {
			this.#htmlVisible.innerHTML = on;
		} else {
			this.#htmlVisible.innerHTML = off;
		}
	}

	static #updateEntityPlaying(entity: Entity): void {
		const entityElement = SceneExplorerEntity.#entitiesHTML.get(entity);
		if (entityElement) {
			entityElement.#updatePlaying();
		}
	}

	#updatePlaying(): void {
		if (this.#entity?.isPlaying()) {
			this.#htmlPlaying.innerHTML = playSVG;
		} else {
			this.#htmlPlaying.innerHTML = pauseSVG;
		}
	}

	expand(visibleEntities?: Set<Entity>): void {
		show(this.#htmlChilds);
		this.#expandChilds(visibleEntities);
		//this.select();
	}

	#expandChilds(visibleEntities?: Set<Entity>): void {
		this.#htmlChilds.innerText = '';
		const entity = this.#entity;

		if (!entity) {
			return;
		}

		for (const child of entity.children) {
			const childHtml = SceneExplorerEntity.getEntityElement(child);
			if (childHtml) {
				if (visibleEntities) {
					if (visibleEntities.has(child)) {
						childHtml.expand(visibleEntities);
					} else {
						hide(childHtml);
					}
				}

				childHtml.setIndentation(this.#indentation + 1);

				this.#htmlChilds.append(childHtml);
			}
		}
	}

	#titleClick(): void {
		if (SceneExplorerEntity.picking) {
			SceneExplorerEntity.#explorer?.pick(this.#entity);
			return;
		}

		if (ShortcutHandler.getControlState()) {
			if (this.#entity) {
				SceneExplorerEntity.#explorer?.addToSelection(this.#entity);
			}
			return;
		}

		if (this == SceneExplorerEntity.#selectedEntity) {
			toggle(this.#htmlChilds);
		} else {
			show(this.#htmlChilds);
		}
		this.#expandChilds();
		SceneExplorerEntity.#explorer?.selectEntity(this.#entity);
	}

	#contextMenuHandler(event: MouseEvent): void {
		if (!event.shiftKey && this.#entity) {
			SceneExplorerEntity.#explorer?.showContextMenu(event.clientX, event.clientY, this.#entity);
			event.preventDefault();
			event.stopPropagation();
		}
	}

	async #displayAnimations(display: boolean): Promise<void> {
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
				innerText: value,
				parent: this.#htmlInputDataList,
			});
		}

		show(this.#htmlAnimations);
		show(this.#htmlContent);
	}

	#initAnimations(): void {
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

	#setAnimName(id: number, name: string): void {
		if (!this.#entity) {
			return;
		}

		(this.#entity as unknown as Animated).playAnimation(name);
		(this.#entity as unknown as Animated).setAnimation(id, name, 1);//TODO: weight
	}

	setIndentation(indentation: number): void {
		this.#indentation = indentation;

		this.style.setProperty('--indentation', String(indentation));

		for (const child of this.#htmlChilds.children) {
			if ((child as SceneExplorerEntity).setIndentation) {
				(child as SceneExplorerEntity).setIndentation(indentation + 1);
			}
		}
	}
}

if (window.customElements) {
	customElements.define('scene-explorer-entity', SceneExplorerEntity);
}
