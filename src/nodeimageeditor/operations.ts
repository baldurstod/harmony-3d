import { Node } from './node';
import { NodeImageEditor } from './nodeimageeditor';

const operations = new Map<string, typeof Node>();

export function registerOperation(name: string, ope: typeof Node) {
	operations.set(name, ope);
}

export function getOperation(name: string, editor: NodeImageEditor, params?: any) {
	const ope = operations.get(name);
	if (!ope) {
		console.warn('Unknown operation : ' + name);
		return null;
	}
	return new (ope)(editor, params);
}
