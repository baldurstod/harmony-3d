let loaders = new Map()

export function registerLoader(name, loader) {
	loaders.set(name, loader);
}

export function getLoader(name) {
	return loaders.get(name);
}
