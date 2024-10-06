import { Shaders } from '../../shaders/shaders';

export * from './operations/export';

import imageeditor_fs from './imageeditor.fs';
import imageeditor_vs from './imageeditor.vs';
Shaders['imageeditor.fs'] = imageeditor_fs;
Shaders['imageeditor.vs'] = imageeditor_vs;
