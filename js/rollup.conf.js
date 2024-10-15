import cleanup from 'rollup-plugin-cleanup';
import {terser} from 'rollup-plugin-terser';

const out_dir = 'src/yafowil/widget/color/resources';
const out_dir_bs5 = 'src/yafowil/widget/color/resources/bootstrap5';

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

    // Bootstrap 5
    let conf_2 = {
        input: 'js/src/bootstrap5/bundle.js',
        plugins: [
            cleanup()
        ],
        output: [{
            name: 'yafowil_color',
            file: `${out_dir_bs5}/widget.js`,
            format: 'iife',
            outro: outro,
            globals: {
                jquery: 'jQuery',
                iro: 'iro',
                popper: 'Popper'
            },
            interop: 'default'
        }],
        external: [
            'jquery',
            'iro',
            'popper'
        ]
    };
    if (args.configDebug !== true) {
        conf_2.output.push({
            name: 'yafowil_color',
            file: `${out_dir_bs5}/widget.min.js`,
            format: 'iife',
            plugins: [
                terser()
            ],
            outro: outro,
            globals: {
                jquery: 'jQuery',
                iro: 'iro',
                popper: 'Popper'
            },
            interop: 'default'
        });
    }
    return [conf, conf_2];
};
