import { ERROR } from '../../../buildoptions';

// TODO can this be merged with kv3element ?
class KvAttribute {
	name: string;
	value: any;
	constructor(name, value) {
		if (!name) {
			return;
		}
		this.name = name.toLowerCase();
		this.value = value;
	}
}
export class KvElement {
	addElement(name, value) {
		if (!name) {
			return;
		}
		name = name.toLowerCase();
		let newName = name;
		let count = 1;
		while (this[newName]) {
			newName = name + '#' + (++count);
		}
		this[newName] = value;
	}
	toString(linePrefix) {
		linePrefix = linePrefix || '';
		const s = [linePrefix, '"'/*, this.type, '"\n'*/, linePrefix, '{\n'];

		for (const i in this) {
			s.push(this.toString(linePrefix + '\t'));
		}
		s.push(linePrefix);
		s.push('}\n');
		return s.join('');
	}
}

export class KvReader {
	root = undefined;
	rootElements: Record<string, any/*TODO: fix type*/> = {};//TODO: create map
	rootId = 0;
	carSize: number;
	src: string;
	offset: number;
	inQuote = false;
	inComment = false;
	currentAttribute;
	currentElement;
	currentArray;
	name;
	currentValue;
	elementStack;
	attributeStack;
	valuesStack;
	keyStack;
	arrayStack;
	rootElement;
	rootName: string;
	currentKey;

	constructor(carSize = 1) {
		this.carSize = carSize;
	}

	readText(src) {
		if (!src) {
			return;
		}
		this.src = src;

		let start = src.indexOf('-->');
		if (start > 0) {
			start += 5;//-->/nx
		} else {
			start = 0;
		}
		this.offset = start;

		this.inQuote = false;
		this.inComment = false;
		this.currentAttribute = undefined;
		this.currentElement = undefined;
		this.currentArray = undefined;
		this.name = undefined;
		this.currentValue = '';

		this.elementStack = [];
		this.attributeStack = [];
		this.valuesStack = [];
		this.keyStack = [];
		this.arrayStack = [];

		let end = false;
		do {
			end = this.parse()
		} while (!end);
		this.endElement();
	}
	getRootElement() {
		return this.rootElement;
	}
	getRootName() {
		return this.rootName;
	}
	readChar() {
		if (this.offset > this.src.length) {
			return -1;
		}
		const offset = this.offset;
		this.offset += this.carSize;
		return this.src.charAt(offset);
	}
	pickChar() {
		if (this.offset > this.src.length) {
			return -1;
		}
		return this.src.charAt(this.offset);
	}
	pushElement() {
		if (this.currentElement) {
			this.elementStack.push(this.currentElement);
		}
		if (!this.rootElement) {
			//this.rootElement = this.currentElement;
		}
		this.currentElement = new KvElement(/*this.popValue()*/);
		this.currentKey = this.popValue();
		this.pushKey();
	}
	popElement() {
		const a = this.currentElement;
		this.currentElement = this.elementStack.pop();
		if (!this.currentElement) {
			//this.rootElements.push(a);
			let rootName = this.popKey();
			if (rootName == undefined) {
				rootName = 'undefined' + (this.rootId++);
			}
			this.rootElements[rootName] = a;
			if (!this.rootElement) {
				this.rootName = rootName;
				this.rootElement = a;
			}
		}
	}
	pushAttribute() {
		if (this.currentAttribute) {
			this.attributeStack.push(this.currentAttribute);
		}
		//this.currentAttribute = new KvElement();
	}
	popAttribute() {
		this.currentAttribute = this.attributeStack.pop();
	}
	pushValue() {
		this.valuesStack.push(this.currentValue);
		this.currentValue = '';
	}
	popValue() {
		if (this.valuesStack.length == 0) {
			if (ERROR) {
				console.error('valuesStack == 0');
			}
		}
		return this.valuesStack.pop();
	}


	pushKey() {
		this.keyStack.push(this.currentKey);
		this.currentKey = '';
	}

	popKey() {
		if (this.keyStack.length == 0) {
			if (ERROR) {
				console.error('keyStack == 0');
			}
		}
		return this.keyStack.pop();
	}

	pushArray() {
		this.arrayStack.push(this.currentArray);
		this.currentArray = undefined;
	}

	popArray() {
		this.currentArray = this.arrayStack.pop();
	}

	parse() {
		const car = this.readChar();
		if (car == -1) return true;

		if (this.inComment && (car != '\r' && car != '\n')) {
			return false;
		}
		this.inComment = false;

		if (this.inQuote && car != '"' && car != '\r' && car != '\n') {
			this.currentValue += car;
		} else {
			switch (car) {
				case '\\':
					if (this.inQuote) {
						const car2 = this.pickChar();
						if (car2 == '\"') {
							this.currentValue += car2;
						} else {
							this.currentValue += car;
						}
					} else {
						this.currentValue += car;
					}
					break;
				case '/':
					const car2 = this.pickChar();
					if (car2 == '/') {
						this.inComment = true;
					} else {
						this.currentValue += car;
					}
					break;
				case ' ':
				case '\t':
					if (this.currentValue != '') {
						this.setValue();
					}
					if (this.valuesStack.length >= 2) {
						this.newLine();

						//if (!this.multipleValuesOnSameLine) {//TODOV2
						this.inComment = true;
						//}
					}
					break;
				case '\r':
				case '\n':
					if (!this.inQuote && this.currentValue != '') this.setValue();
					this.newLine();
					break;
				case '"':
					if (this.inQuote) this.setValue();
					this.inQuote = !this.inQuote;
					break;
				case '{':
					if (this.currentValue != '') {
						this.setValue();
					}
					this.startElement();
					break;
				case '}':
					this.endElement();
					break;
				case '[':
					this.startArray();
					break;
				case ']':
					this.endArray();
					break;
				case ',':
					this.comma();
					//this.nextArrayValue()
					break;
				default:
					this.currentValue += car;
					break;
			}
		}
		return false;
	}

	startElement() {
		this.pushElement();

		this.newLine();
		this.pushAttribute();
	}

	endElement() {
		if (this.currentElement) {
			const e = this.currentElement;
			this.popElement();
			if (this.currentElement) {
				this.currentElement.addElement(this.popKey(), e);
			}
		}
	}

	startArray() {
		this.pushArray();
		this.currentValue = [];
		this.currentArray = this.currentValue;
		this.pushValue();
		this.newLine();
		this.pushAttribute();
	}

	endArray() {
		this.popAttribute();
		//this.currentAttribute.value.push(this.currentElement);
		this.popArray();

	}

	nextArrayValue() {
		//TODO
	}

	setValue() {
		this.pushValue();
	}

	newLine() {
		if (this.valuesStack.length >= 2) {
			// order matters
			const value = this.popValue();
			const name = this.popValue();
			const newAttribute = new KvAttribute(name, value);


			if (this.currentElement) {
				this.currentElement.addElement(name, value);

			} else if (this.currentArray) {
				this.currentArray.push(newAttribute);
			}
			this.currentAttribute = newAttribute;
		}
	}

	comma() {
		if (this.valuesStack.length >= 1) {
			// order matters
			const value = this.popValue();
			const name = this.popValue();
			const newAttribute = new KvAttribute(name, value);

			if (this.currentArray) {
				this.currentArray.push(newAttribute);
			} else if (this.currentElement) {
				this.currentElement.addAttribute(newAttribute);
			}
			this.currentAttribute = newAttribute;
		}
	}
}
