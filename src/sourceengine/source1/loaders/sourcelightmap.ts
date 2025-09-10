/**
 * Light Map
 */
export const SELightMap = function (height: number, width: number) {//TODOv3
}

let lightMapNodeId = 0;

/**
 * TODO
 */
export class SELightMapNode {
	x: number;
	y: number;
	width: number;
	height: number;
	content = null;
	filled = false;
	id = ++lightMapNodeId;
	sub1?: SELightMapNode;
	sub2?: SELightMapNode;

	constructor(x: number, y: number, width: number, height: number) {
		this.y = y;
		this.x = x;
		this.height = height;
		this.width = width;
	}

	setContent(content: never) {
		if (this.sub1) {
			return false;
		}
		this.content = content;
	}

	split(x: number, y: number) {
		if (this.content) return false;
		if (this.filled) return false;
		if (y >= this.height) return false;
		if (x >= this.width) return false;
		if (y != 0 && x != 0) return false;

		if (y == 0) { /* splitting vertically */
			this.sub1 = new SELightMapNode(this.x, this.y, x, this.height);
			this.sub2 = new SELightMapNode(this.x + x, this.y, this.width - x, this.height);
		} else { /* splitting horizontally */
			this.sub1 = new SELightMapNode(this.x, this.y, this.width, y);
			this.sub2 = new SELightMapNode(this.x, this.y + y, this.width, this.height - y);
		}
	}

	allocate(width: number, height: number): SELightMapNode | null {
		if (this.filled) return null;
		if (this.content) return null;
		if (height == 0) return null;
		if (width == 0) return null;
		if (height > this.height) return null;
		if (width > this.width) return null;
		let node;

		if (this.sub1) {
			node = this.sub1.allocate(width, height);
			if (node) {
				this.checkFull();
				return node;
			}
		}

		if (this.sub2) {
			node = this.sub2.allocate(width, height);
			if (node) {
				this.checkFull();
				return node;
			}
		}

		if (height == this.height && width == this.width) {
			this.filled = true;
			return this;
		}

		if ((height / this.height) > (width / this.width)) {
			this.split(width, 0);
		} else {
			this.split(0, height);
		}

		if (this.sub1) {
			node = this.sub1.allocate(width, height);
			if (node) {
				this.checkFull();
				return node;
			}
		}

		if (this.sub2) {
			node = this.sub2.allocate(width, height);
			this.checkFull();
			if (node) {
				this.checkFull();
				return node;
			}
		}

		return null;
	}

	toString() {
		return this.id;
	}

	checkFull() {
		if (this.sub1?.filled && this.sub2?.filled) {
			this.filled = true;
		}
	}

	getAllocatedSize() {
		let total = 0;
		if (this.sub1) {
			total += this.sub1?.getAllocatedSize() ?? 0;
			total += this.sub2?.getAllocatedSize() ?? 0;
			return total;
		}
		if (this.filled) {
			return this.height * this.width;
		}
		return 0;
	}
}
