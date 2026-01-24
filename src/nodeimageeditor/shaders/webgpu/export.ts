import { Shaders } from '../../../shaders/shaders';

export * from './operations/export';

import imageeditor from './imageeditor.wgsl';
Shaders['imageeditor.wgsl'] = imageeditor;
