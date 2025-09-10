import { vec3 } from 'gl-matrix';
import { Camera } from '../../../../cameras/camera';
import { Scene } from '../../../../scenes/scene';
import { KvElement } from '../../loaders/kvreader';
import { MapEntities } from '../mapentities';
import { AngleVectors, MapEntity, ParseAngles, ParseVector } from '../mapentity';
import { OutputEvent } from './outputevent';

/**
 * Map entity
 */
export class FuncDoor extends MapEntity {
	onFullyOpen = new OutputEvent('OnFullyOpen');
	onFullyClosed = new OutputEvent('OnFullyClosed');
	model: null | { model: number, origin: vec3, position: vec3, dirty: boolean } = null;
	speed = 0;
	moveDir = vec3.create();
	pos1 = vec3.create();
	pos2 = vec3.create();
	finalDest = vec3.create();

	setKeyValues(kvElement: KvElement): void {
		super.setKeyValues(kvElement);

		const result = /^\*(\d*)$/.exec((kvElement as any/*TODO: fix that*/).model);
		if (result && result.length >= 2) {
			this.model = { model: result[1]!, origin: ParseVector(vec3.create(), (kvElement as any/*TODO: fix that*/).origin) ?? vec3.create(), position: vec3.create(), dirty: true };
			//if (kvElement.rendermode && kvElement.rendermode != 10) {
			this.map.funcBrushesRemoveMe.push(this.model);
			//}
		}

		const movedistance = (kvElement as any/*TODO: fix that*/).movedistance;
		this.speed = (kvElement as any/*TODO: fix that*/).speed;
		vec3.zero(this.moveDir);
		const moveDir = ParseAngles(vec3.create() /*TODO: optimize*/, (kvElement as any/*TODO: fix that*/).movedir);
		if (moveDir) {
			AngleVectors(moveDir, this.moveDir);
		}

		if (!this.model?.model) {
			return;
		}

		const vecOBB = this.map.getOBBSize(this.model.model);
		if (vecOBB) {
			this.pos1 = this.getAbsOrigin();//vec3.scaleAndAdd(vec3.create(), this.getAbsOrigin(), this.moveDir, -movedistance * kvElement.startposition);
			const a = this.moveDir;
			const b = vecOBB;
			const dotProductAbs = Math.abs(a[0] * b[0]) + Math.abs(a[1] * b[1]) + Math.abs(a[2] * b[2]);//vec3.dot(vec3.create(), this.moveDir, vecOBB);
			this.pos2 = vec3.scaleAndAdd(this.pos2, this.pos1, this.moveDir, dotProductAbs);//todo : lip
			vec3.copy(this.finalDest, this.getAbsOrigin());
		}
	}

	setInput(inputName: string): void {
		switch (inputName.toLowerCase()) {
			case 'open':
				this.inputOpen();
				break;
			case 'close':
				this.inputClose();
				break;

			/*
			DEFINE_INPUTFUNC(FIELD_VOID,	'Open', InputOpen),
			DEFINE_INPUTFUNC(FIELD_VOID,	'Close', InputClose),
			DEFINE_INPUTFUNC(FIELD_FLOAT, 'SetPosition', InputSetPosition),
			DEFINE_INPUTFUNC(FIELD_FLOAT, 'SetSpeed', InputSetSpeed),
			*/
		}
	}

	update(scene: Scene, camera: Camera, delta: number) {
		super.update(scene, camera, delta);
		if (this.model && this.model.origin) {
			if ((this._position[0] != this.model.origin[0]) || (this._position[1] != this.model.origin[1]) || (this._position[2] != this.model.origin[2])) {
				//vec3.copy(this.model.origin, this._position);
				this.model.position = this._position;
				this.model.dirty = true;//removeme ?
			}
		}

		if (this.m_flMoveDoneTime <= this.m_flLocalTime && this.m_flMoveDoneTime > 0) {
			this.setMoveDoneTime(-1);
			//vec3.copy(this.origin, this.finalDest);
			this.position = this.finalDest;
			vec3.set(this.m_vecVelocity, 0, 0, 0);
			this.moveDone();
		}
	}

	inputOpen(): void {
		if (vec3.squaredDistance(this.getAbsOrigin(), this.pos2) != 0) {
			this.moveTo(this.pos2, this.speed);
		}
	}

	inputClose(): void {
		if (vec3.squaredDistance(this.getAbsOrigin(), this.pos1) != 0) {
			this.moveTo(this.pos1, this.speed);
		}
	}

	moveTo(position: vec3, speed: number): void {
		if (speed) {
			this.linearMove(position, speed);
		}
	}

	linearMove(destination: vec3, speed: number): void {
		this.finalDest = vec3.clone(destination);
		const origin = this.getLocalOrigin();
		if (vec3.squaredDistance(origin, destination) < 0.001) {
			this.moveDone();
			return;
		}
		const vecDelta = vec3.sub(vec3.create(), destination, origin);
		const travelTime = vec3.length(vecDelta) / speed;
		this.setMoveDoneTime(travelTime);
		this.setLocalVelocity(vec3.scale(vecDelta, vecDelta, 1.0 / travelTime));
	}

	moveDone(): void {
		if (vec3.squaredDistance(this.getAbsOrigin(), this.pos2) == 0) {
			this.onFullyOpen.fireOutput(this, this);
		} else if (vec3.squaredDistance(this.getAbsOrigin(), this.pos1) == 0) {
			this.onFullyClosed.fireOutput(this, this);
		}
	}

	getAbsOrigin(): vec3 {
		return this._position;
	}
}
MapEntities.registerEntity('func_door', FuncDoor);
