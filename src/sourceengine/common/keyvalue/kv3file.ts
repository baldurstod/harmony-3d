import { Kv3Array } from './kv3array';
import { Kv3Value } from './kv3value';

/**
 * Kv3File
 */
export class Kv3File {
	root: any = null;
	setRoot(root) {
		this.root = root;
	}
	exportAsText() {
		if (this.root) {
			return this.root.exportAsText('');
		}
		return null;
	}
	getValue(path) {
		var arr = path.split('.');
		var data = this.root;
		if (!data) {
			return null;
		}


		var sub;
		for (var i = 0; i < arr.length; i++) {
			sub = data[arr[i]];
			if (!sub) {
				return null;
			}
			if (sub instanceof Kv3Array) {
				data = sub.properties;
			} else {
				data = sub;
			}
		}

		if (data instanceof Kv3Value) {
			return data.v;
		} else {
			return data;
		}
	}
}
