import { FlexAnimationTrack } from './flexanimationtrack';
import { Source1SoundManager } from '../sounds/soundmanager';
import { Choreography } from './choreography';
import { Channel } from './channel';


export class Event {
	#repository;
	type;
	name;
	startTime;
	endTime;
	param1;
	param2;
	param3;
	flags;
	distanceToTarget = 0;
	flexAnimTracks: any = {};
	ramp;
	ccType;
	ccToken;
	choreography: Choreography;
	channel: Channel;
	m_nNumLoops;
	constructor(repository, eventType, name, startTime, endTime, param1, param2, param3, flags, distanceToTarget) {
		this.#repository = repository;
		this.type = eventType;
		this.name = name;
		this.startTime = startTime;
		this.endTime = endTime;
		this.param1 = param1;
		this.param2 = param2;
		this.param3 = param3;
		this.flags = flags;
		this.distanceToTarget = distanceToTarget;
	}

	getRepository() {
		return this.#repository;
	}

	/**
	 * Get the startTime
	 * @return {Number} startTime
	 */
	getStartTime() {
		return this.startTime;
	}

	/**
	 * Get the endTime
	 * @return {Number} endTime
	 */
	getEndTime() {
		return this.endTime;
	}


	/**
	 * Get the type
	 * @return {Number} The loaded file
	 */
	getType() {
		return this.type;
	}

	/**
	 * Set the ramp
	 * @param {Object CurveData} ramp The ramp to set
	 */
	setRamp(ramp) {
		this.ramp = ramp;
	}

	/**
	 * TODO
	 */
	setCloseCaptionType(ccType) {
		this.ccType = ccType;
	}

	/**
	 * TODO
	 */
	setCloseCaptionToken(token) {
		this.ccToken = token;
	}

	/**
	 * TODO
	 */
	setChoreography(choreography: Choreography) {
		this.choreography = choreography;
	}

	/**
	 * TODO
	 */
	setChannel(channel) {
		this.channel = channel;
	}

	//TODO
	AddRelativeTag() {
		console.error('TODO');
	}

	//TODO
	addRelativeTag() {
		console.error('TODO');
	}
	//TODO
	addTimingTag() {
		console.error('TODO');
	}
	//TODO
	addAbsoluteTag() {
		console.error('TODO');
	}

	/**
	 * TODO
	 */
	isResumeCondition() {
		return (this.flags & (1 << 0)) ? true : false;
	}
	/**
	 * TODO
	 */
	isLockBodyFacing() {
		return (this.flags & (1 << 1)) ? true : false;
	}
	/**
	 * TODO
	 */
	isFixedLength() {
		return (this.flags & (1 << 2)) ? true : false;
	}
	/**
	 * TODO
	 */
	isActive() {
		return (this.flags & (1 << 3)) ? true : false;
	}
	/**
	 * TODO
	 */
	getForceShortMovement() {
		return (this.flags & (1 << 4)) ? true : false;
	}
	/**
	 * TODO
	 */
	getPlayOverScript() {
		return (this.flags & (1 << 5)) ? true : false;
	}

	/**
	 * TODO
	 * Add a flex animation track
	 */
	addTrack(controllerName) {
		let track = new FlexAnimationTrack(this);
		track.setFlexControllerName(controllerName);
		this.flexAnimTracks[controllerName] = track;
		return track;
	}

	/**
	 * toString
	 */
	toString(indent) {
		indent = indent || '';
		const subindent = indent + '\t';
		let arr = [];
		arr.push(indent + 'Event ' + EventType[this.type] + ' ' + this.name);
		arr.push(subindent + 'time ' + this.startTime + ' ' + this.endTime);
		if (this.param1) {
			arr.push(subindent + 'param1 ' + this.param1);
		}
		if (this.param2) {
			arr.push(subindent + 'param2 ' + this.param2);
		}
		if (this.param3) {
			arr.push(subindent + 'param3 ' + this.param3);
		}
		if (this.ramp) {
			arr.push(this.ramp.toString(subindent));
		}

		if (this.getType() == EventType.Flexanimation) {
			arr.push(subindent + 'flexanimations');
		}

		for (let i in this.flexAnimTracks) {
			arr.push(this.flexAnimTracks[i].toString(subindent + '\t'));
		}

		if (this.getType() == EventType.Speak) {
			arr.push(subindent + 'cctype ' + CloseCaptionType[this.ccType]);
			arr.push(subindent + 'cctoken ' + this.ccToken);
		}
		return arr.join('\n');
	}

	/**
	 * Step
	 */
	step(previousTime, currentTime) {
		//TODOv2
		if (previousTime < this.startTime && currentTime >= this.startTime) {
			//console.info(frame2, currentTime, this.type, this.param1, this.param2, this.param3);
			switch (this.type) {
				case EventType.Speak:
					Source1SoundManager.playSound(this.#repository, this.param1);
					break;
				case EventType.Sequence:
					let actor = this.getActor();
					//mainCharacter.characterModel.playSequence(this.param1);//TODOv2
					if (actor) {
						actor.playSequence(this.param1);//TODOv2
						actor.frame = currentTime;
						/*if (actor.characterModel) {
							actor.playSequence(this.param1);//TODOv2
						}
						if (actor.sourceModel) {
							actor.playSequence(this.param1);//TODOv2
						}*/
					}
					//frame2 = currentTime;
					break;
				case EventType.Loop:
					//TODO: loop count
					if (this.choreography) {
						this.choreography.loop(this.param1 * 1.0);
						//frame2 = this.param1 * 1.0;
					}
					break;
			}
			return;
		}


		if (previousTime < this.endTime && currentTime >= this.endTime) {
			//console.info(frame2, currentTime, this.type, this.param1, this.param2, this.param3);
			switch (this.type) {
				case EventType.Sequence:
					const actor = this.getActor();
					if (actor) {
						if (actor.characterModel) {
							actor.characterModel.playSequence('stand_secondary');//TODOv2
						}
					}
					//frame2 = currentTime;
					break;
			}
		}

		if (currentTime >= this.startTime && currentTime <= this.endTime) {
			switch (this.type) {
				/*case EventType.Expression:
					let actor = this.getActor();
					if (actor) {
						let flexParameters = {};
						flexParameters[this.param2.toLowerCase()] = this.ramp.getValue(currentTime);
						actor.setFlexes(flexParameters);
					}
					break;*/
			}
		}
	}

	/**
	 * TODO
	 */
	getActor() {
		const channel = this.channel;
		if (channel) {
			const actor = channel.getActor();
			if (actor) {
				return actor.getCharacter();
			}
		}
	}
}

export enum EventType {
	Unspecified = 0,
	Section,
	Expression,
	LookAt,
	MoveTo,
	Speak,
	Gesture,
	Sequence,
	Face,
	FireTrigger,
	Flexanimation,
	SubScene,
	Loop,
	Interrupt,
	StopPoint,
	PermitResponses,
	Generic,

}
//TODO: setup const
/*
Event.EventType = {
	UNSPECIFIED: 0,
	SECTION: 1,
	EXPRESSION: 2,
	LOOKAT: 3,
	MOVETO: 4,
	SPEAK: 5,
	GESTURE: 6,
	SEQUENCE: 7,
	FACE: 8,
	FIRETRIGGER: 9,
	FLEXANIMATION: 10,
	SUBSCENE: 11,
	LOOP: 12,
	INTERRUPT: 13,
	STOPPOINT: 14,
	PERMIT_RESPONSES: 15,
	GENERIC: 16
}
Event.EventTypeString = ['UNSPECIFIED', 'SECTION', 'EXPRESSION', 'LOOKAT', 'MOVETO', 'SPEAK', 'GESTURE', 'SEQUENCE', 'FACE', 'FIRETRIGGER', 'FLEXANIMATION', 'SUBSCENE', 'LOOP', 'INTERRUPT', 'STOPPOINT', 'PERMIT_RESPONSES', 'GENERIC']
*/


export enum TimeType {
	Default = 0,
	Simulation,
	Display,
}

/*
Event.TimeType = {
	DEFAULT: 0,
	SIMULATION: 1,
	DISPLAY: 2
}
Event.TimeTypeString = ['DEFAULT', 'SIMULATION', 'DISPLAY'];
*/

export enum CloseCaptionType {
	Master = 0,
	Slave,
	Disabled,
}

/*
Event.CloseCaptionType = {
	CC_MASTER: 0,
	CC_SLAVE: 1,
	CC_DISABLED: 2
}
Event.CloseCaptionTypeString = ['CC_MASTER', 'CC_SLAVE', 'CC_DISABLED'];
*/
