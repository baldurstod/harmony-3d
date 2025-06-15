import { Includes } from './includes';
import { ShaderEventTarget } from './shadereventtarget';

const includeSources = new Map<string, string>();
const customIncludeSources = new Map<string, string>();

export function addIncludeSource(name: string, source = '') {
	includeSources.set(name, source);
	ShaderEventTarget.dispatchEvent(new CustomEvent('includeadded'));
}

export function getIncludeSource(name: string) {
	if (!includeSources.has(name)) {
		addIncludeSource(name, Includes[name]);
		if (!customIncludeSources.has(name) && Includes[name] === undefined) {
			console.error('unknown include ' + name);
		}
	}
	return customIncludeSources.get(name) ?? includeSources.get(name);
}

export function setCustomIncludeSource(name: string, source: string) {
	if (source == '') {
		customIncludeSources.delete(name);
	} else {
		customIncludeSources.set(name, source);
	}
}

export function getIncludeList() {
	return includeSources.keys();
}
