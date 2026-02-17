import { Source2Material } from '../source2material';
import { Source2MaterialLoader } from '../../loaders/source2materialloader';

export class Source2VrMonitor extends Source2Material {

	override get shaderSource(): string {
		return 'source2_vr_monitor';
	}
}
Source2MaterialLoader.registerMaterial('vr_monitor.vfx', Source2VrMonitor);
