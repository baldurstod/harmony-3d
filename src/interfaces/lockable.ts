export interface Lockable {
	isLockable: true;

	lockPosition: boolean;
	lockRotation: boolean;
	lockScale: boolean;
	isAnyLocked: () => boolean;
	lockAll: (locked: boolean) => void;
}
