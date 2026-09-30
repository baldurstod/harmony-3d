export interface HasMaterials {
	getSkins(): Promise<Set<string>>;
	getMaterialsName(skin: string): Promise<[string, Set<string>]>;
	setSkinId(skin: number): Promise<void>;
	setSkinName(skin: string): Promise<void>;
}
