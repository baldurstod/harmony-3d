import { vec3 } from 'gl-matrix';

import { MapEntity, ParseVector, AngleVectors, ParseAngles } from '../mapentity';
import { MapEntities } from '../mapentities';
import { OutputEvent } from './outputevent';

/**
 * Map entity
 */
export class FuncDoor extends MapEntity {
	onFullyOpen = new OutputEvent('OnFullyOpen');
	onFullyClosed = new OutputEvent('OnFullyClosed');
	model = null;
	speed = 0;
	moveDir = vec3.create();
	pos1 = vec3.create();
	pos2 = vec3.create();
	finalDest = vec3.create();

	setKeyValues(kvElement) {
		super.setKeyValues(kvElement);

		const result = /^\*(\d*)$/.exec(kvElement.model);
		if (result) {
			this.model = {model:result[1], origin: ParseVector(kvElement.origin)};
			//if (kvElement.rendermode && kvElement.rendermode != 10) {
				this.map.funcBrushesRemoveMe.push(this.model);
			//}
		}

		if (kvElement) {
			const movedistance = kvElement.movedistance;
			this.speed = kvElement.speed;
			vec3.zero(this.moveDir);
			AngleVectors(ParseAngles(kvElement.movedir), this.moveDir);

			const vecOBB = this.m.getOBBSize(this.model.model);
			this.pos1 = this.getAbsOrigin();//vec3.scaleAndAdd(vec3.create(), this.getAbsOrigin(), this.moveDir, -movedistance * kvElement.startposition);
			const a = this.moveDir;
			const b = vecOBB;
			const dotProductAbs = Math.abs(a[0] * b[0]) + Math.abs(a[1] * b[1]) + Math.abs(a[2] * b[2]);//vec3.dot(vec3.create(), this.moveDir, vecOBB);
			this.pos2 = vec3.scaleAndAdd(this.pos2, this.pos1, this.moveDir, dotProductAbs);//todo : lip
			vec3.copy(this.finalDest, this.getAbsOrigin());

		}
	}

	setInput(inputName, parameter) {
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

	update(map, delta) {
		super.update(map, delta);
		if (this.model) {
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

	inputOpen() {
		if (vec3.squaredDistance(this.getAbsOrigin(), this.pos2) != 0) {
				this.moveTo(this.pos2, this.speed);
		}
	}

	inputClose() {
		if (vec3.squaredDistance(this.getAbsOrigin(), this.pos1) != 0) {
				this.moveTo(this.pos1, this.speed);
		}
	}

	moveTo(position, speed) {
		if (speed) {
				this.linearMove(position, speed);
		}
	}

	linearMove(destination, speed) {
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

	moveDone() {
		if (vec3.squaredDistance(this.getAbsOrigin(), this.pos2) == 0) {
			this.onFullyOpen.fireOutput(this, this);
		} else if (vec3.squaredDistance(this.getAbsOrigin(), this.pos1) == 0) {
			this.onFullyClosed.fireOutput(this, this);
		}
	}

	getAbsOrigin() {
		return this._position;
	}
}
MapEntities.registerEntity('func_door', FuncDoor);
