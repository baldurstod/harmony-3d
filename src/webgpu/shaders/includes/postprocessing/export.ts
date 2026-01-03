import { addWgslInclude } from '../../../../shaders/includemanager';

import postprocessing_vertex from './postprocessing_vertex.wgsl';
addWgslInclude('postprocessing_vertex', postprocessing_vertex);
