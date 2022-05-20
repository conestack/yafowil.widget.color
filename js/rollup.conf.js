import cleanup from 'rollup-plugin-cleanup';
import {terser} from 'rollup-plugin-terser';

const out_dir = 'src/yafowil/widget/color/resources';

const outro = `
window.yafowil = window.yafowil || {};
window.yafowil.color = exports;
`;

export default args => {
    let conf = {
        input: 'js/src/bundle.js',
        plugins: [
            cleanup()
        ],
        output: [{
            name: 'yafowil_color',
            file: `${out_dir}/widget.js`,
            format: 'iife',
            outro: outro,
            globals: {
                jquery: 'jQuery',
                iro: 'iro'
            },
            interop: 'default'
        }],
        external: [
            'jquery',
            'iro'
        ]
    };
    if (args.configDebug !== true) {
        conf.output.push({
            name: 'yafowil_color',
            file: `${out_dir}/widget.min.js`,
            format: 'iife',
            plugins: [
                terser()
            ],
            outro: outro,
            globals: {
                jquery: 'jQuery',
                iro: 'iro'
            },
            interop: 'default'
        });
    }
    return conf;
};
