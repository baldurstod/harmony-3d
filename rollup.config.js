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
			'harmony-browser-utils',
			'harmony-fbx',
			'harmony-vpk',
			'murmurhash-es6',
			'meshoptimizer',
			'@derschmale/io-rgbe',
			'@zip.js/zip.js',
		],
	},
];


async function postBuildCommands() {
	fs.copyFile(TEMP_BUILD, './dist/index.js', err => { if (err) throw err });
	return new Promise(resolve => child_process.exec(
		'api-extractor run --local --verbose --typescript-compiler-folder ./node_modules/typescript',
		(error, stdout, stderr) => {
			if (error) {
				console.log(error);
			}
			resolve("done")
		},
	));
}
