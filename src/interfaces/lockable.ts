export interface Lockable {
	isLockable: true;
	setLocked: (locked: boolean) => void;
	isLocked: () => boolean;
}
