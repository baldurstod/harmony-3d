import fs from 'fs';
import child_process from 'child_process';
import image from '@rollup/plugin-image';
import css from 'rollup-plugin-import-css';
import typescript from '@rollup/plugin-typescript';
import wasm from '@rollup/plugin-wasm';

const TEMP_BUILD = './dist/dts/index.js';

export default [
	{
		input: './src/index.ts',
		output: {
			file: TEMP_BUILD,
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
			{
				name: 'postbuild-commands',
				closeBundle: async () => {
					await postBuildCommands()
				}
			},
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


async function postBuildCommands() {
	fs.copyFile(TEMP_BUILD, './dist/index.js', err => { if (err) throw err });
	return new Promise(resolve => child_process.exec(
		'api-extractor run --local --verbose --typescript-compiler-folder ./node_modules/typescript ',
		() => resolve("done"),
	));

}
