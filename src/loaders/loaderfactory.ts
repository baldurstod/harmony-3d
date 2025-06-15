const loaders = new Map<string, any>()

export function registerLoader(name: string, loader: any): void {
	loaders.set(name, loader);
}

export function getLoader(name: string): any | undefined {
	return loaders.get(name);
}
