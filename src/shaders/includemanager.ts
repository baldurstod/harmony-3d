import { setWgslInclude } from 'wgsl-preprocessor';
import { ShaderType } from '../webgl/types';
import { Includes, WgslIncludes } from './includes';
import { ShaderEventTarget } from './shadereventtarget';

const includeSources = new Map<string, string>();//TODO: remove and replace by includeSources2
const includeSources2 = new Set<string>();
const customIncludeSourcesGlsl = new Map<string, string>();
const customIncludeSourcesWgsl = new Map<string, string>();

export function addIncludeSource(name: string, source = '') {
	includeSources.set(name, source);
	includeSources2.add(name);
	ShaderEventTarget.dispatchEvent(new CustomEvent('includeadded'));
}

export function getIncludeSource(name: string, type: ShaderType): string | undefined {
	if (type == ShaderType.Wgsl) {
		return getIncludeSourceWgsl(name);
	} else {
		return getIncludeSourceGlsl(name);
	}
}

function getIncludeSourceGlsl(name: string): string | undefined {
	if (!includeSources.has(name)) {
		const include = Includes[name];
		addIncludeSource(name, include);
		if (!customIncludeSourcesGlsl.has(name) && include === undefined) {
			console.error('unknown include ' + name);
		}
	}
	return customIncludeSourcesGlsl.get(name) ?? includeSources.get(name);
}

function getIncludeSourceWgsl(name: string): string | undefined {
	if (!includeSources.has(name)) {
		const include = WgslIncludes.get(name);
		addIncludeSource(name, include);
		if (!customIncludeSourcesWgsl.has(name) && include === undefined) {
			console.error('unknown include ' + name);
		}
	}
	return customIncludeSourcesWgsl.get(name) ?? includeSources.get(name);
}

export function setCustomIncludeSource(name: string, source: string, type: ShaderType) {
	if (type == ShaderType.Wgsl) {
		return setCustomIncludeSourceWgsl(name, source);
	} else {
		return setCustomIncludeSourceGlsl(name, source);
	}
}

function setCustomIncludeSourceGlsl(name: string, source: string) {
	if (source == '') {
		customIncludeSourcesGlsl.delete(name);
	} else {
		customIncludeSourcesGlsl.set(name, source);
	}
}

function setCustomIncludeSourceWgsl(name: string, source: string) {
	if (source == '') {
		customIncludeSourcesWgsl.delete(name);
	} else {
		customIncludeSourcesWgsl.set(name, source);
	}
	setWgslInclude(name, getIncludeSourceWgsl(name) ?? '');
}

export function getIncludeList() {
	return includeSources2;
}
