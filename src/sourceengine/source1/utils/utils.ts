export function stringStrip(s: string): string {
	return s.replace(/^[\s\0]+/, '').replace(/[\s\0]+$/, '')
}
