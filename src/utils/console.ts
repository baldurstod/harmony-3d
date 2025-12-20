import { Map2 } from 'harmony-utils';

const messages = new Map2<string, string, number>();

export function errorOnce(message: string, max = 1): void {
	if (!messages.has('error', message)) {
		messages.set('error', message, 0);
	}

	const newCount = messages.get('error', message)! + 1;
	messages.set('error', message, newCount);

	if (newCount <= max) {
		console.error(message);
	}
}
