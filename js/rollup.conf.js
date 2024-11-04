import cleanup from 'rollup-plugin-cleanup';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';

const out_dir = 'src/yafowil/widget/color/resources';

const outro = `
window.yafowil = window.yafowil || {};
window.yafowil.color = exports;
`;

export default args => {
    let conf = [];

    ////////////////////////////////////////////////////////////////////////////
    // DEFAULT
    ////////////////////////////////////////////////////////////////////////////

    let bundle_default = {
        input: 'js/src/default/bundle.js',
        plugins: [
            cleanup()
        ],
        output: [{
            name: 'yafowil_color',
            file: `${out_dir}/default/widget.js`,
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
        bundle_default.output.push({
            name: 'yafowil_color',
            file: `${out_dir}/default/widget.min.js`,
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
    let scss_default = {
        input: ['scss/default/widget.scss'],
        output: [{
            file: `${out_dir}/default/widget.min.css`,
            format: 'es',
            plugins: [terser()],
        }],
        plugins: [
            postcss({
                extract: true,
                minimize: true,
                use: [
                    ['sass', { outputStyle: 'compressed' }],
                ],
            }),
        ],
    };
    conf.push(bundle_default, scss_default);

    ////////////////////////////////////////////////////////////////////////////
    // BOOTSTRAP5
    ////////////////////////////////////////////////////////////////////////////

    let bundle_bs5 = {
        input: 'js/src/bootstrap5/bundle.js',
        plugins: [
            cleanup()
        ],
        output: [{
            name: 'yafowil_color',
            file: `${out_dir}/bootstrap5/widget.js`,
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
        bundle_bs5.output.push({
            name: 'yafowil_color',
            file: `${out_dir}/bootstrap5/widget.min.js`,
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
    let scss_bs5 = {
        input: ['scss/bootstrap5/widget.scss'],
        output: [{
            file: `${out_dir}/bootstrap5/widget.min.css`,
            format: 'es',
            plugins: [terser()],
        }],
        plugins: [
            postcss({
                extract: true,
                minimize: true,
                use: [
                    ['sass', { outputStyle: 'compressed' }],
                ],
            }),
        ],
    };
    conf.push(bundle_bs5, scss_bs5);

    return conf;
};
