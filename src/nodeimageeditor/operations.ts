import { Node } from './node';
import { NodeImageEditor } from './nodeimageeditor';

const operations = new Map<String, typeof Node>();

export function registerOperation(name: string, ope: typeof Node) {
	operations.set(name, ope);
}

export function getOperation(name: string, editor: NodeImageEditor, params?: any) {
	if (!operations.has(name)) {
		console.warn('Unknown operation : ' + name);
		return null;
	}
	return new (operations.get(name))(editor, params);
}
