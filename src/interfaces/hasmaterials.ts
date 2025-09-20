export interface HasMaterials {
	getSkins: () => Promise<Set<string>>;
	getMaterialsName: (skin: string) => Promise<[string, Set<string>]>;
	setSkin(skin: string): Promise<void>;
}
