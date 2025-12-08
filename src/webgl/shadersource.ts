import { DEBUG } from '../buildoptions';
import { getIncludeSource } from '../shaders/includemanager';
import { GL_FRAGMENT_SHADER, GL_VERTEX_SHADER } from './constants';

export enum ShaderType {
	Vertex = GL_VERTEX_SHADER,
	Fragment = GL_FRAGMENT_SHADER,
	Wgsl = 'wgsl',
}

function getHeader(type: ShaderType): string {
	switch (type) {
		case ShaderType.Vertex:
			return '#include header_vertex';
		case ShaderType.Fragment:
			return '#include header_fragment';
		case ShaderType.Wgsl:
			return '';
	}
}

const PRAGMA_REGEX = /#pragma (\w+)/;

export interface Annotation {
	type: string,
	row: number,
	column: number,
	length?: number,
	text: string,
};

export interface WebGPUUniform {
	type: string,
	alignment: number,
	size: number,
};

// TODO: rename this class to ShaderSource, also used for webgpu
export class WebGLShaderSource {
	static isWebGL2: boolean;
	#includes = new Set<string>();
	#type: ShaderType;
	#source = '';
	#extensions = '';
	#sizeOfSourceRow: number[] = [];
	#sourceRowToInclude = new Map<number, [string, number]>();
	#compileSource = '';
	#isErroneous = false;
	#error = '';
	#lineDelta = 0;
	#compilationInfo: GPUCompilationInfo | null = null;

	constructor(type: ShaderType, source: string) {
		if (DEBUG && type === undefined) {
			throw new Error('error : type must be defined in WebGLShaderSource');
		}
		this.#type = type;
		this.setSource(source);
	}

	setSource(source: string): void {
		this.#source = source;
		this.#extensions = '';
		this.#sizeOfSourceRow = [];
		this.#sourceRowToInclude.clear();
		this.#includes.clear();
		const allIncludes = new Set();

		const sourceLineArray = source.split('\n');
		sourceLineArray.unshift(getHeader(this.#type) ?? '');
		let compileRow = 1;
		//TODOv3: use regexp to do a better job
		const outArray: string[] = [];
		for (let i = 0; i < sourceLineArray.length; ++i) {
			const line = sourceLineArray[i]!;
			let actualSize = 1;
			if (line.startsWith('#extension')) {
				this.#extensions += line + '\n';
				sourceLineArray.splice(i, 1);
				actualSize = 0;
			} else if (line.trim().startsWith('#include')) {
				//this.extensions += line + '\n';
				const includeName = line.replace('#include', '').trim();
				const include = this.getInclude(includeName, compileRow, new Set(), allIncludes);
				if (include) {
					this.#sourceRowToInclude.set(compileRow, [includeName, include.length]);
					outArray.push(...include);
					compileRow += include.length;
					actualSize = include.length;
				} else {
					if (include === undefined) {
						console.error(`Include not found : ${line}`)
					}
				}
			} else {
				outArray.push(line);
				++compileRow;
			}
			this.#sizeOfSourceRow[i] = actualSize;
		}
		this.#compileSource = outArray.join('\n');

		this.#isErroneous = false;
		this.#error = '';
		this.#compilationInfo = null;
		this.#lineDelta = 0;
	}

	isErroneous(): boolean {
		return this.#isErroneous;
	}

	getSource(): string {
		return this.#source;
	}

	getInclude(includeName: string, compileRow = 0, recursion = new Set<string>(), allIncludes = new Set<string>()): string[] | undefined | null {
		this.#includes.add(includeName);
		if (recursion.has(includeName)) {
			console.error('Include recursion in ' + includeName);
			return undefined;
		}
		recursion.add(includeName);
		const include = getIncludeSource(includeName);
		if (include == undefined) {
			return undefined;
		}

		const includeLineArray = include.trim().split('\n');
		includeLineArray.unshift('');//Add an empty line to insure nested include won't occupy the same line #
		const outArray: string[] = [];
		for (let i = 0, l = includeLineArray.length; i < l; ++i) {
			const line = includeLineArray[i]!;
			if (line.trim().startsWith('#include')) {
				const includeName = line.replace('#include', '').trim();
				const include = this.getInclude(includeName, compileRow + i, recursion, allIncludes);
				if (include) {
					this.#sourceRowToInclude.set(compileRow, [includeName, include.length]);
					outArray.push(...include);
					compileRow += include.length;
				}
				continue;
			}
			if (line.trim().startsWith('#pragma')) {
				const result = PRAGMA_REGEX.exec(line);
				if (result && result[1] == 'once') {
					if (allIncludes.has(includeName)) {
						return null;
					}
					continue;
				}
			}
			outArray.push(line);
			++compileRow;
		}
		allIncludes.add(includeName);
		return outArray;
	}

	getCompileSource(includeCode = ''): string {
		function getDefineValue(defineName: string, includeCode = ''): string {
			const sourceLineArray = includeCode.split('\n');
			const definePattern = /\s*#define\s+(\S+)\s+(\S+)/;
			for (const line of sourceLineArray) {
				const regexResult = definePattern.exec(line);
				if (regexResult && defineName) {
					if (regexResult[1] == defineName) {
						return regexResult[2]!;
					}
				}
			}
			return defineName;
		}

		function unrollLoops(source: string, includeCode = ''): string {
			let nextUnroll = Infinity;
			let unrollSubstring;
			const forPattern = /for\s*\(\s*int\s+(\S+)\s*=\s*(\S+)\s*;\s*(\S+)\s*<\s*(\S+)\s*;\s*(\S+)\s*\+\+\s*\)\s*{/g;

			while ((nextUnroll = source.lastIndexOf('#pragma unroll', nextUnroll - 1)) != -1) {
				forPattern.lastIndex = 0;
				unrollSubstring = source.substring(nextUnroll);
				const regexResult = forPattern.exec(unrollSubstring);
				if (regexResult && regexResult.length == 6) {
					const loopVariable = regexResult[1];
					if ((loopVariable == regexResult[3]) && (loopVariable == regexResult[5])) {//Check the variable name is the same everywhere
						let startIndex = forPattern.lastIndex;
						let curlyCount = 1;//we already ate one
						const startLoopName = regexResult[2]!;
						const endLoopName = regexResult[4]!;
						let loopSnippet = '';
						curlyLoop:
						while (startIndex != -1) {
							let car = unrollSubstring.charAt(startIndex++);
							switch (car) {
								case '/':
									car = unrollSubstring.charAt(startIndex++);
									switch (car) {
										case '*':
											startIndex = unrollSubstring.indexOf('*/', startIndex);
											if (startIndex != -1) {
												startIndex += 2;
											}
											break;
										case '/':
											startIndex = unrollSubstring.indexOf('\n', startIndex);
											break;
									}
									break;
								case '{':
									++curlyCount;
									break;
								case '}':
									--curlyCount;
									if (curlyCount == 0) {
										loopSnippet = source.substring(nextUnroll + forPattern.lastIndex, nextUnroll + startIndex - 1);
										break curlyLoop;
									}
									break;
								default:
							}
						}
						if (loopSnippet) {
							const loopVariableRegexp = new RegExp('\\[\\s*' + loopVariable + '\\s*\\]', 'g');
							const loopVariableRegexp2 = new RegExp('\\{\\s*' + loopVariable + '\\s*\\}', 'g');
							const startLoopIndex = Number.parseInt(getDefineValue(startLoopName, includeCode));
							const endLoopIndex = Number.parseInt(getDefineValue(endLoopName, includeCode));
							let unrolled = '';
							for (let i = startLoopIndex; i < endLoopIndex; i++) {
								unrolled += loopSnippet.replace(loopVariableRegexp, `[${i}]`).replace(loopVariableRegexp2, `${i}`);
							}
							source = source.substring(0, nextUnroll - 1) + unrolled + source.substring(nextUnroll + startIndex);
						}
					}
				}
			}
			return source;

		}

		if (this.#type == ShaderType.Wgsl) {
			parseWgsl(includeCode + this.#compileSource);
			return includeCode + this.#compileSource;
		} else {
			return (WebGLShaderSource.isWebGL2 ? '#version 300 es\n' : '\n') + this.#extensions + includeCode + unrollLoops(this.#compileSource, includeCode);
		}
	}

	getCompileSourceLineNumber(includeCode: string): string {
		const source = this.getCompileSource(includeCode);
		const sourceLineArray = source.split('\n');
		for (let i = sourceLineArray.length - 1; i >= 0; i--) {
			sourceLineArray[i] = (i + 1).toString().padStart(4) + ' ' + sourceLineArray[i];
		}
		return sourceLineArray.join('\n');
	}

	setCompileError(error: string, includeCode = ''): void {
		let lineDelta = ((includeCode).match(/\n/g) || []).length;
		if (this.#type == ShaderType.Fragment || this.#type == ShaderType.Vertex) {
			lineDelta += 1;//#version line
		}

		this.#isErroneous = true;
		this.#error = error;
		this.#lineDelta = lineDelta;
	}

	setCompilationInfo(compilationInfo: GPUCompilationInfo): void {
		this.#isErroneous = true;
		this.#compilationInfo = compilationInfo;
		this.#lineDelta = 0;
	}

	getCompileError(convertRows = true): Annotation[] {
		if (this.#type == ShaderType.Wgsl) {
			return this.#getWebGPUCompileError(convertRows);
		} else {
			return this.#getWebGLCompileError(convertRows);
		}
	}

	#getWebGLCompileError(convertRows = true): Annotation[] {
		const errorArray: Annotation[] = [];
		const splitRegex = /(ERROR|WARNING) *: *(\d*):(\d*): */;

		function consumeLine(arr: string[]): string | null {
			let line;
			while ((line = arr.shift()) !== undefined) {
				if (line === '') {
					continue;
				}
				return line;
			}
			return null;
		}

		const arr = this.#error.replace('\n', '').split(splitRegex);
		while (arr.length) {
			const errorType = consumeLine(arr);
			const errorCol = consumeLine(arr);
			const errorRow = Number(consumeLine(arr));
			const errorText = consumeLine(arr);
			if (errorType && errorCol && errorRow && errorText) {
				let row = Math.max(errorRow - this.#lineDelta, 0);
				if (convertRows) {
					row = this.compileRowToSourceRow(row);
				}
				row = Math.max(row, 0);
				errorArray.push({ type: errorType.toLowerCase(), column: Number(errorCol), row: row, text: errorText });
			}
		}
		return errorArray;
	}

	#getWebGPUCompileError(convertRows = true): Annotation[] {
		const errorArray: Annotation[] = [];

		if (this.#compilationInfo) {
			for (const message of this.#compilationInfo.messages) {
				let row = Math.max(message.lineNum - this.#lineDelta, 0);
				if (convertRows) {
					row = this.compileRowToSourceRow(row);
				}

				const lines = message.message.split('\n');
				// Drop the message beyond the first line; webgpu compilation messages can be very verbose
				errorArray.push({ type: message.type, column: message.linePos, row, text: lines[0]!, length: message.length });
			}
		}

		return errorArray;
	}

	getIncludeAnnotations(): Annotation[] {
		const annotations: Annotation[] = [];

		const sourceLineArray = this.#source.split('\n');
		sourceLineArray.unshift(getHeader(this.#type) ?? '');

		for (let i = sourceLineArray.length - 1; i >= 0; i--) {
			const line = sourceLineArray[i]!;
			if (line.trim().startsWith('#include')) {
				const include = this.getInclude(line.replace('#include', '').trim());
				if (include) {
					include.shift();//Remove the first empty line
					annotations.push({ type: 'info', column: 0, row: Math.max(i - 1, 0), text: include.join('\n') });
				}
			}
		}
		return annotations;
	}

	compileRowToSourceRow(row: number): number {
		let totalSoFar = 0;
		for (let i = 0; i < this.#sizeOfSourceRow.length; i++) {
			totalSoFar += this.#sizeOfSourceRow[i]!;
			if (totalSoFar >= row) {
				return i - 1;
			}
		}
		return 0;
	}

	isValid(): boolean {
		return (this.#source != '') && !this.#isErroneous;
	}

	reset(): void {
		this.#isErroneous = false;
		this.setSource(this.#source);
	}

	containsInclude(includeName: string): boolean {
		return this.#includes.has(includeName);
	}

	getType(): ShaderType {
		return this.#type;
	}

	getSourceRowToInclude(): Map<number, [string, number]> {
		return new Map(this.#sourceRowToInclude);
	}
	/*
		#getUniforms(source: string): void {
			const uniforms: WebGPUUniform[][] = [];


			const sourceLineArray = source.split('\n');
			sourceLineArray.unshift(getHeader(this.#type) ?? '');
			let compileRow = 1;
			//TODOv3: use regexp to do a better job
			const outArray: string[] = [];
			for (let i = 0; i < sourceLineArray.length; ++i) {
				const line = sourceLineArray[i]!;
				let actualSize = 1;
				if (line.startsWith('#extension')) {
					this.#extensions += line + '\n';
					sourceLineArray.splice(i, 1);
					actualSize = 0;
				} else if (line.trim().startsWith('#include')) {
					//this.extensions += line + '\n';
					const includeName = line.replace('#include', '').trim();
					const include = this.getInclude(includeName, compileRow, new Set(), allIncludes);
					if (include) {
						this.#sourceRowToInclude.set(compileRow, [includeName, include.length]);
						outArray.push(...include);
						compileRow += include.length;
						actualSize = include.length;
					} else {
						if (include === undefined) {
							console.error(`Include not found : ${line}`)
						}
					}
				} else {
					outArray.push(line);
					++compileRow;
				}
				this.#sizeOfSourceRow[i] = actualSize;
			}
		}
			*/
}



export enum WgslToken {
	At,
	OpenBrace,
	CloseBrace,
	OpenParenthesis,
	CloseParenthesis,
	Colon,
	Comma,
	//EOF,
}

function* getNextChar(wgsl: string): Generator<string, null, unknown> {
	let offset = 0;
	const length = wgsl.length;

	for (const c of wgsl) {
		yield c;
	}
	return null;
}

type ShaderUniform = {
	binding: number;
	group: number;
	uniforms: Map<string, number>;
}

type WgslVar = {
	name: string;
	type: string;// TODO: create an enum ?
}

type WgslStruct = {
	name: string;
	vars: WgslVar[];
}
/**
 *
 * @param source
 * @returns
 */
function parseWgsl(source: string): ShaderUniform[] {
	const uniforms: ShaderUniform[] = [];
	//const syntaxError = new Error('syntax error');

	const structs = new Map<string, WgslStruct>();

	let currentStruct: WgslStruct | null = null;
	let beginAttribute = false;

	const tokenIterator = getNextToken(source);
	for (const token of tokenIterator) {
		switch (token) {
			case 'struct':
				const structName = tokenIterator.next().value;
				if (typeof structName != 'string') {
					//throw syntaxError;
					return uniforms;
				}
				currentStruct = { name: structName, vars: [] };

				const t = tokenIterator.next().value;
				if (t != WgslToken.OpenBrace) {
					//throw syntaxError;
					return uniforms;
				}

				for (const token of tokenIterator) {
					if (token == WgslToken.CloseBrace) {
						// Terminate the struct
						structs.set(currentStruct.name, currentStruct);
						break;
					}

					const StructName = token;
					if (typeof StructName != 'string') {
						//throw syntaxError;
						return uniforms;
					}


					const colon = tokenIterator.next().value;
					if (colon != WgslToken.Colon) {
						//throw syntaxError;
						return uniforms;
					}

					const structType = tokenIterator.next().value;
					if (typeof structType != 'string') {
						//throw syntaxError;
						return uniforms;
					}

					const commaOrClosingBrace = tokenIterator.next().value;
					if (commaOrClosingBrace != WgslToken.Comma && commaOrClosingBrace != WgslToken.CloseBrace) {
						//throw syntaxError;
						return uniforms;
					}

					currentStruct.vars.push({ name: StructName, type: structType });
				}

				break;
			case WgslToken.At:
				break
			case WgslToken.CloseBrace:
				break;
			default:
				break;
		}
		//console.info(token);
	}

	console.info(structs);

	return uniforms;
}
/*
function* getNextToken(source: string): Generator<WgslToken | string, void, unknown> {
	const iterator = getNextToken2(source);
	for (const token of iterator) {
		console.info(token);
		yield token;
	}
}
*/

function* getNextToken(source: string): Generator<WgslToken | string, void, unknown> {
	let offset = 0;
	const length = source.length;

	let forwardSlash = false;
	let lineComment = false;
	let blockComment = false;
	let literal = false;
	let literalString = '';

	const charIterator = getNextChar(source);
	for (const char of charIterator) {
		if (lineComment) {
			// Eat chars until EOL
			if (char == '\n' || char == '\r') {
				lineComment = false;
			}
			continue;
		}

		if (blockComment) {
			// Eat chars until end of block comment
			if (char == '*' && charIterator.next().value == '/') {
				blockComment = false;
			}
			continue;
		}

		if (literal && (char == '{' || char == '}' || char == '(' || char == ')' || char == ':' || char == ',' || char == '\n' || char == '\r' || char == '/' || char == ' ' || char == '\t')) {
			// Terminate and emit the string
			yield literalString;
			literal = false;
			literalString = '';
		}

		switch (char) {
			case '@':
				yield WgslToken.At;
				break;
			case '{':
				yield WgslToken.OpenBrace;
				break;
			case '}':
				yield WgslToken.CloseBrace;
				break;
			case '(':
				yield WgslToken.OpenParenthesis;
				break;
			case ')':
				yield WgslToken.CloseParenthesis;
				break;
			case ':':
				yield WgslToken.Colon;
				break;
			case ',':
				yield WgslToken.Comma;
				break;
			case '\n':
			case '\r':
				// EOL is not a statement terminator, do nothing unless we are in a line comment or a string (handled above)
				break;
			case '/':
				if (forwardSlash) {
					// Start a line comment
					forwardSlash = false;
					lineComment = true;
				} else {
					forwardSlash = true;
				}
				break;
			case '*':
				if (forwardSlash) {
					// Start a block comment
					forwardSlash = false;
					blockComment = true;
				} else {
					literalString += char;
				}
				break;
			case ' ':
			case '\t':
				break;
			default:
				literal = true;
				literalString += char;
				break;
		}
	}
}
