import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'index.js',
    output: [
        {
            file: './dist/index.js',
            format: 'umd',
            name: 'validateTypes'
        },
        {
            file: './dist/index.min.js',
            format: 'umd',
            name: 'validateTypes',
            plugins: [terser()]
        }
    ],
    plugins: [commonjs()]
};
