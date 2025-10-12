import { int } from 'harmony-types';

export function getRandomInt(max: int): int {
	return Math.floor(Math.random() * max);
}
