import { vec4 } from 'gl-matrix';

export interface Tintable {
	isTintable: true;
	setTint(tint: vec4 | null): void;
	getTint(out?: vec4): vec4 | null;
}
