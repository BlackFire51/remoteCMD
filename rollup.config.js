import path from 'path';
import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import autoExternal from 'rollup-plugin-auto-external';
import json from 'rollup-plugin-json'
import globals from 'rollup-plugin-node-globals';

export default {
    input: path.resolve(__dirname, './src/server.ts'),
    output: {
        file: './index.js',
        format: 'cjs'
    },
    external: [
    ],
    plugins: [
        typescript(),
        autoExternal({
            dependencies: true, // false
            packagePath: path.resolve('./package.json'),
            peerDependencies: false
        }),
        globals(),
        resolve({
            jsnext: true,
            main: true
        }),
        commonjs({
            include: '../node_modules/**',
            sourceMap: false
        }),
        //terser(),
        json(),
    ],
}