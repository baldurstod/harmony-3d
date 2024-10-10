/**
 * Light Map
 */
export const SELightMap = function(height, width) {//TODOv3
}

let lightMapNodeId = 0;

/**
 * TODO
 */
export const SELightMapNode = function(x, y, width, height) {
	this.y = y;
	this.x = x;
	this.height = height;
	this.width = width;
	this.content = null;
	this.filled = false;
	this.id = ++lightMapNodeId;
}

/**
 * TODO
 */
SELightMapNode.prototype.setContent = function(content) {
	if (this.sub1) return false;
	this.content = content;
}

/**
 * TODO
 */
SELightMapNode.prototype.split = function(x, y) {
	if (this.content) return false;
	if (this.filled) return false;
	if (y>=this.height) return false;
	if (x>=this.width) return false;
	if (y!=0&&x!=0) return false;

	if (y==0) { /* splitting vertically */
		this.sub1 = new SELightMapNode(this.x, this.y, x, this.height);
		this.sub2 = new SELightMapNode(this.x + x, this.y, this.width-x, this.height);
	} else { /* splitting horizontally */
		this.sub1 = new SELightMapNode(this.x, this.y, this.width, y);
		this.sub2 = new SELightMapNode(this.x, this.y + y, this.width, this.height-y);
	}
}

/**
 * TODO
 */
SELightMapNode.prototype.allocate = function(width, height) {
	if (this.filled) return false;
	if (this.content) return false;
	if (height==0) return false;
	if (width==0) return false;
	if (height>this.height) return false;
	if (width>this.width) return false;
	let node;

	if (this.sub1) {
		node=this.sub1.allocate(width, height);
		if (node) {
			this.checkFull();
			return node;
		}
	}

	if (this.sub2) {
		node=this.sub2.allocate(width, height);
		if (node) {
			this.checkFull();
			return node;
		}
		return false;
	}

	if (height==this.height&&width==this.width) {
		this.filled = true;
		return this;
	}

	if ((height/this.height)>(width/this.width)) {
		this.split(width, 0);
	} else {
		this.split(0, height);
	}

	if (this.sub1) {
		node=this.sub1.allocate(width, height);
		if (node) {
			this.checkFull();
			return node;
		}
	}

	if (this.sub2) {
		node=this.sub2.allocate(width, height);
		this.checkFull();
		if (node) {
			this.checkFull();
			return node;
		}
	}

	return null;
}

/**
 * TODO
 */
SELightMapNode.prototype.toString = function() {
	return this.id;
}

/**
 * TODO
 */
SELightMapNode.prototype.checkFull = function() {
	if (this.sub1.filled&&this.sub2.filled) {
		this.filled = true;
	}
}

/**
 * TODO
 */
SELightMapNode.prototype.getAllocatedSize = function() {
	let total = 0;
	if (this.sub1) {
		total+= this.sub1.getAllocatedSize();
		total+= this.sub2.getAllocatedSize();
		return total;
	}
	if (this.filled) {
		return this.height*this.width;
	}
	return 0;
}
