// chromium binary
process.env.CHROME_BIN = '/usr/bin/chromium';

// karma config
module.exports = function(config) {
    config.set({
        basePath: 'karma',
        frameworks: [
            'qunit'
        ],
        files: [{
            pattern: '../node_modules/jquery/src/**/*.js',
            type: 'module',
            included: false
        }, {
            pattern: '../node_modules/@jaames/iro/dist/iro.js',
            included: true
        },
        {
            pattern: '../js/src/*.js',
            type: 'module',
            included: false
        }, {
            pattern: '../js/tests/test_*.js',
            type: 'module'
        },
        {
            pattern: '../src/yafowil/widget/color/resources/widget.css',
            included: true
        }],
        browsers: [
            'ChromeHeadless'
        ],
        singlerun: true,
        reporters: [
            'progress',
            'coverage'
        ],
        preprocessors: {
            '../js/src/*.js': [
                'coverage',
                'module-resolver'
            ],
            '../js/tests/*.js': [
                'coverage',
                'module-resolver'
            ]
        },
        moduleResolverPreprocessor: {
            addExtension: 'js',
            customResolver: null,
            ecmaVersion: 6,
            aliases: {
                jquery: '../node_modules/jquery/src/jquery.js',
                iro: '../node_modules/@jaames/iro/dist/iro.es.js'
            }
        }
    });
};