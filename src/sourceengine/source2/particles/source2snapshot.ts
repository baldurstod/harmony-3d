import { Source2File } from '../loaders/source2file';

export class Source2Snapshot {
	particleCount = 0;
	attributes: any = {};
	file: Source2File | null = null;

	setParticleCount(particleCount: number): void {
		this.particleCount = particleCount;
	}
}
