import image from '@rollup/plugin-image';
import css from 'rollup-plugin-import-css';
import typescript from '@rollup/plugin-typescript';
import wasm from '@rollup/plugin-wasm';

export default [
	{
		input: './src/index.ts',
		output: {
			file: './dist/index.js',
			format: 'esm',
		},
		plugins: [
			css(),
			image(),
			typescript(),
			wasm(
				{
					maxFileSize: 1000000
				}
			),
			//dts(),
			/*
			webWorkerLoader({
				targetPlatform: 'node'
			}),
			*/
		],
		external: [
			'gl-matrix',
			'harmony-binary-reader',
			'harmony-browser-utils',
			'harmony-svg',
			'harmony-ui',
			'harmony-ui/dist/define/harmony-context-menu',
			'harmony-ui/dist/define/harmony-color-picker',
			'harmony-ui/dist/define/harmony-2d-manipulator',
			'harmony-browser-utils/src/shortcuthandler',
			'harmony-fbx',
			'murmurhash-es6',
			'meshoptimizer',
			'@derschmale/io-rgbe',
		],
	},
];
