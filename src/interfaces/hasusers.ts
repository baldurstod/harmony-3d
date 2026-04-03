export interface ObjectUser {}

export interface HasUsers {
	addUser(user: ObjectUser): void;
	removeUser(user: ObjectUser): void;
	hasNoUser(): boolean;
	hasOnlyUser(user: ObjectUser): boolean;
}
