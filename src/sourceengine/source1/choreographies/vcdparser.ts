import { Actor } from './actor';
import { Channel } from './channel';
import { Choreography } from './choreography';
import { CurveData } from './curvedata';
import { ChoreographyEvent, ChoreographyEventName, ChoreographyEventParam, EventType } from './event';

type VcdParserContext = {
	choreography: Choreography;
	s: string;
	offset: number;
	len: number;
	//error: boolean;
}

export class VcdParser {
	static parse(repository: string, content: string): Choreography | null/*TODO: should output a definition*/ {
		//const vdf = parseVdf(content);
		//console.info(vdf);

		const context: VcdParserContext = {
			choreography: new Choreography(repository),
			s: content,
			offset: 0,
			len: content.length,
			//error: false,
		};

		const parseResult = parseVdf(context);

		if (!parseResult) {
			return null;
		}

		return context.choreography;
	}
}

function parseVdf(context: VcdParserContext): boolean {
	while (true) {
		const token = getNextToken(context);
		switch (token) {
			case null:
				return true;
			case 'event':
				const event = parseEvent(context);
				if (!event) {
					return false;
				}
				context.choreography.addEvent(event);
				break;
			case 'actor':
				const actor = parseActor(context);
				if (!actor) {
					return false;
				}
				context.choreography.addActor(actor);
				break;
		}
	}
}

function parseEvent(context: VcdParserContext): ChoreographyEvent | null {
	let eventType: EventType | undefined = ChoreographyEventName.get(getNextToken(context)!);
	if (!eventType) {
		return null;
	}

	const eventName = getNextToken(context);
	if (eventName == null) {
		return null;
	}

	if (getNextToken(context, false) != '{') {
		return null;
	}

	let startTime = 0;
	let endTime = 0;
	let param1: ChoreographyEventParam;
	let param2: ChoreographyEventParam;
	let param3: ChoreographyEventParam;
	let ramp: CurveData | null;

	TokenLoop:
	while (true) {
		const token = getNextToken(context, false);
		switch (token) {
			case null:
				// missing }
				return null;
			case '}':
				break TokenLoop;
			case 'time':
				startTime = parseFloat(getNextToken(context)!);
				if (Number.isNaN(startTime)) {
					return null;
				}
				endTime = parseFloat(getNextToken(context)!);
				if (Number.isNaN(endTime)) {
					endTime = 1.0;
				}
				break;
			case 'param':
				param1 = getNextToken(context);
				break;
			case 'param2':
				param2 = getNextToken(context);
				break;
			case 'param3':
				param3 = getNextToken(context);
				break;
			case 'event_ramp':
				ramp = parseRamp(context);
				if (!ramp) {
					return null;
				}
				break;
			default:
				console.warn('code token', token);
		}
	}

	console.log('parseEvent', eventType, eventName, startTime, endTime, param1, param2, param3);
	return new ChoreographyEvent(context.choreography, context.choreography.getRepository(), eventType, eventName, startTime, endTime, param1, param2, param3, 0, 0);
}

function parseActor(context: VcdParserContext): Actor | null {
	const actorName = getNextToken(context);
	if (actorName == null) {
		return null;
	}

	if (getNextToken(context, false) != '{') {
		return null;
	}

	const actor = new Actor(context.choreography, actorName);

	TokenLoop:
	while (true) {
		const token = getNextToken(context, false);
		switch (token) {
			case null:
				// missing }
				return null;
			case '}':
				break TokenLoop;
			case 'channel':
				const channel = parseChannel(context);
				if (!channel) {
					return null;
				}
				actor.addChannel(channel);
				break;
			default:
				console.warn('code token', token);
		}
	}

	return actor;
}

function parseChannel(context: VcdParserContext): Channel | null {
	const channelName = getNextToken(context);
	if (channelName == null) {
		return null;
	}

	if (getNextToken(context, false) != '{') {
		return null;
	}

	const channel = new Channel(channelName);

	TokenLoop:
	while (true) {
		const token = getNextToken(context, false);
		switch (token) {
			case null:
				// missing }
				return null;
			case '}':
				break TokenLoop;
			case 'event':
				const event = parseEvent(context);
				if (!event) {
					return null;
				}
				channel.addEvent(event);
				break;
			default:
				console.warn('code token', token);
		}
	}

	return channel;
}

function parseRamp(context: VcdParserContext): CurveData | null {
	if (getNextToken(context, false) != '{') {
		return null;
	}

	let time = 0;
	let value = 0;

	const ramp = new CurveData();

	TokenLoop:
	while (true) {
		const token = getNextToken(context, false);
		switch (token) {
			case null:
				// missing }
				return null;
			case '}':
				break TokenLoop;
			default:
				time = parseFloat(token);
				if (Number.isNaN(time)) {
					return null;
				}
				value = parseFloat(getNextToken(context)!);
				if (Number.isNaN(value)) {
					return null;
				}
				ramp.add(time, value, false);
				console.log('parseRamp', time, value);
		}
	}

	return ramp;
}

function getNextToken(context: VcdParserContext, lineEnd: boolean = true): string | null {
	if (lineEnd) {
		return getNextTokenInternal(context);
	} else {
		while (1) {
			const token = getNextTokenInternal(context);
			if (token != '\n') {
				return token;
			}
		}
	}

	return null;
}


function getNextTokenInternal(context: VcdParserContext): string | null {
	while (context.offset < context.len) {
		const c = getNextRune(context);
		switch (c) {
			case '{':
				return '{';
			case '}':
				return '}';
			case '\r':
			case '\n':
				return '\n';
			case ' ':
			case '\t':
				//just eat a char
				break;
			case '"':
				let s = "";
				while (context.offset < context.len) {
					const c = getNextRune(context);
					switch (c) {
						/*
						case '\\':
							if (context.offset < context.len) {
								const c = getNextRune(context);
								if (c == '"') {
									s += '\\"'
								} else {
									s += '\\' + c;
								}
							}
						*/
						case '"':
							return s;
						default:
							s += c;
					}
				}
				break;
			case '/':
				while (context.offset < context.len) {
					const c = getNextRune(context);
					if (c == '\r' || c == '\n') {
						break;
					}
				}
				break;
			default:
				// unquoted string
				let unquoted = c;
				while (context.offset < context.len) {
					const c = getNextRune(context);
					switch (c) {
						case '"':
						case '\'':
							throw "Quote in an unquoted string";
						case '{':
						case '}':
							// Get back one character
							--context.offset;
						//fallthrough
						case ' ':
						case '\t':
						case '\r':
						case '\n':
							return unquoted;
						default:
							unquoted += c;
					}
				}
				break;
		}
	}
	return null;

}

function getNextRune(context: VcdParserContext): string {
	return context.s[context.offset++]!;
}
