import {ColorWidget} from '../src/widget.js';

let elem = $('<input class="color-picker"/>');
let widget;

QUnit.module('ColorWidget', hooks => {

    hooks.before(() => {
        $('body').append('<div id="container" />');
    });
    hooks.beforeEach(() => {
        $('#container').append(elem);
    });
    hooks.afterEach(() => {
        $('#container').empty();
        localStorage.removeItem('color-swatches');
        widget = null;
    });
    hooks.after(() => {
        $('#container').empty().remove();
    });

    QUnit.test('initialize', assert => {
        ColorWidget.initialize();
        widget = elem.data('color_widget');
        assert.ok(widget.elem.attr('spellcheck'), false);
        assert.deepEqual(widget.elem, elem);
    });

    QUnit.test('default constructor', assert => {
        ColorWidget.initialize();
        widget = elem.data('color_widget');
        assert.strictEqual(widget.elem.attr('spellcheck'), 'false');
        assert.strictEqual(widget.elem.attr('maxlength'), '7');

        // preview element
        assert.ok(widget.preview_elem.hasClass('color-picker-color'));
        assert.strictEqual(widget.color_swatches.length, 0);
        assert.strictEqual(widget.elem.val(), '#ffffff');
        // hex white gets transformed to rgb value
        assert.strictEqual(
            widget.preview_elem.css('background-color'),
            'rgb(255, 255, 255)'
        );
        // iro picker exists
        assert.ok(widget.picker);
    });

    QUnit.test('parse json in constructor', assert => {
        // mock json file
        let swatches = [
            {h: 0, s: 0, l: 80},
            {h: 0, s: 100, l: 50}
        ];
        localStorage.setItem("color-swatches", JSON.stringify(swatches));

        // initialize
        ColorWidget.initialize();
        widget = elem.data('color_widget');

        // assertions
        assert.strictEqual(widget.color_swatches.length, 2);
        assert.deepEqual(widget.active_swatch, widget.color_swatches[1]);
        assert.ok(widget.color_swatches[1].elem.hasClass('selected'));
    });

    QUnit.test('preview_elem', assert => {
        // create preview elem
        let prev_elem = $('<div id="preview" style="width:2px; height:2px" />');
        $('body').append(prev_elem);
        let options = {
            preview_elem: $('#preview')
        }
        let widget = new ColorWidget(elem, options);
        // preview element is set
        assert.deepEqual(widget.preview_elem, prev_elem);
        prev_elem.remove();
    });

    QUnit.test('init_options: hsl_display', assert => {
        let options = {
            hsl_display: true
        }
        let widget = new ColorWidget(elem, options);
        assert.ok(widget.hsl_display);
        assert.deepEqual(widget.hsl_display.value, widget.picker.color.hsl);
    });

    QUnit.test('init_options: hex_display', assert => {
        let widget = new ColorWidget(elem, {hex_display: true});
        assert.ok(widget.hex_display);
        assert.strictEqual(
            widget.hex_display.value,
            widget.picker.color.hexString
        );
    });

    QUnit.test('input', assert => {
        ColorWidget.initialize();
        widget = elem.data('color_widget');

        // correct hex input
        widget.elem.val('#cccccc');
        widget.elem.trigger('input');
        assert.strictEqual(widget.picker.color.hexString, "#cccccc");

        // empty input
        widget.elem.val('');
        widget.elem.trigger('input');
        assert.strictEqual(widget.elem.val(), "#");

        // correct hex input
        widget.elem.val('#213öasd');
        widget.elem.trigger('input');
        assert.strictEqual(widget.picker.color.hexString, "#cccccc");
    });

    QUnit.test('trigger_handle', assert => {
        // initialize
        let widget = new ColorWidget(elem);
        assert.strictEqual(widget.dropdown_elem.css('display'), 'none');

        // trigger on input focus
        widget.elem.trigger('focus');
        assert.strictEqual(widget.dropdown_elem.css('display'), 'block');

        // mousedown inside picker
        widget.dropdown_elem.trigger('mousedown');
        assert.strictEqual(widget.dropdown_elem.css('display'), 'block');

        // mousedown outside picker
        $('body').trigger('mousedown');
        assert.strictEqual(widget.dropdown_elem.css('display'), 'none');

        // click on preview elem
        widget.preview_elem.trigger('click');
        assert.strictEqual(widget.dropdown_elem.css('display'), 'block');
        widget.preview_elem.trigger('click');
        assert.strictEqual(widget.dropdown_elem.css('display'), 'none');
    });

    QUnit.test('handle_keypress', assert => {
        // initialize
        let widget = new ColorWidget(elem);
        assert.strictEqual(widget.dropdown_elem.css('display'), 'none');

        // trigger input focus
        widget.elem.trigger('focus');
        assert.strictEqual(widget.dropdown_elem.css('display'), 'block');

        // trigger Enter key
        let enter_key = $.Event('keydown', {key: 'Enter'});
        $(window).trigger(enter_key);
        assert.strictEqual(widget.dropdown_elem.css('display'), 'none');

        // trigger input focus
        widget.elem.trigger('focus');
        assert.strictEqual(widget.dropdown_elem.css('display'), 'block');

        // trigger Escape key
        let escape_key = $.Event('keydown', {key: 'Escape'});
        $(window).trigger(escape_key);
        assert.strictEqual(widget.dropdown_elem.css('display'), 'none');
    });

    QUnit.test('close', assert => {
        // initialize
        let widget = new ColorWidget(elem);
        assert.strictEqual(widget.dropdown_elem.css('display'), 'none');

        // trigger input focus
        widget.elem.trigger('focus');
        assert.strictEqual(widget.dropdown_elem.css('display'), 'block');

        // click close btn
        widget.close_btn.trigger('click');
        assert.strictEqual(widget.dropdown_elem.css('display'), 'none');
        assert.false(widget.elem.is(':focus'));
    });

    QUnit.test.skip('create_swatch, remove_swatch, set_swatches', assert => {
        // initialize
        let widget = new ColorWidget(elem);
        assert.strictEqual(widget.swatches_container.css('display'), 'none');

        // open menu by click
        widget.preview_elem.trigger('click');
        assert.strictEqual(widget.color_swatches.length, 0);

        // click add color
        widget.add_color_btn.trigger('click');
        // assertions
        assert.strictEqual(widget.swatches_container.css('display'), 'block');
        assert.strictEqual(widget.color_swatches.length, 1);
        assert.deepEqual(
            widget.color_swatches[0].color,
            widget.picker.color.hsl
        );

        // add same color again
        widget.add_color_btn.trigger('click');
        assert.strictEqual(widget.color_swatches.length, 1);

        // add second color
        widget.picker.color.hexString = '#cccccc';
        widget.add_color_btn.trigger('click');
        assert.strictEqual(widget.color_swatches.length, 2);
        assert.strictEqual(
            widget.preview_elem.css('background-color'),
            'rgb(204, 204, 204)'
        );
        assert.ok($('#cccccc').hasClass('selected'));

        // click on first swatch
        $('#ffffff').trigger('click');
        assert.strictEqual(widget.hex, '#ffffff');
        assert.strictEqual(
            widget.picker.color.hexString,
            '#ffffff'
        );
        assert.strictEqual(
            widget.preview_elem.css('background-color'),
            'rgb(255, 255, 255)'
        );
        assert.false($('#cccccc').hasClass('selected'));
        assert.ok($('#ffffff').hasClass('selected'));

        // JSON localStorage
        let swatches = [];
        for (let swatch of widget.color_swatches) {
            swatches.push(swatch.color);
        }
        assert.strictEqual(
            localStorage.getItem('color-swatches'),
            JSON.stringify(swatches)
        );

        // delete swatch with keypress
        let delKey = $.Event('keydown', { key: 'Delete' });
        $(window).trigger(delKey);
        assert.strictEqual($('div.color-swatch').length, 1);
        assert.strictEqual($('div#ffffff').length, 0);
        assert.strictEqual(
            widget.picker.color.hexString,
            '#cccccc'
        );

        // delete swatch with button
        widget.remove_color_btn.trigger('click');
        assert.strictEqual($('div.color-swatch').length, 0);
        assert.strictEqual($('div#cccccc').length, 0);
        assert.notOk(localStorage.getItem('color-swatches'));

        assert.strictEqual(widget.hex, '#ffffff');
        assert.strictEqual(widget.picker.color.hexString, '#ffffff');
    });

    QUnit.test('create over 12 swatches', assert => {
        // initialize
        let widget = new ColorWidget(elem);
        assert.strictEqual(widget.swatches_container.css('display'), 'none');

        // open menu by click
        widget.preview_elem.trigger('click');
        assert.strictEqual(widget.color_swatches.length, 0);

        let colors = [
            '#83ee01', '#05074b', '#ae47ed', '#eb6ef2', '#c2c9a1', '#8e84b4',
            '#d8c576', '#add2b4', '#05013d', '#4edbb3', '#420c21', '#a23bf6',
            '#fe9185'
        ]
        // add swatches
        for (let i = 0; i < 13; i++) {
            widget.picker.color.hexString = colors[i];
            widget.add_color_btn.trigger('click');
        }
        assert.strictEqual(widget.color_swatches.length, 12);
    });

    QUnit.module('mobile and resize', hooks => {
        let original_width = $(window).width();
        hooks.afterEach(() => {
            viewport.set(original_width);
        });

        QUnit.test('mobile initialization', assert => {
            viewport.set(300);
            // initialize
            let widget = new ColorWidget(elem);
            assert.ok(widget.dropdown_elem.hasClass('mobile'));
        });

        QUnit.test('resizing', assert => {
            // initialize
            let widget = new ColorWidget(elem);
            assert.notOk(widget.dropdown_elem.hasClass('mobile'));

            viewport.set(300);
            $(window).trigger('resize');
            assert.ok(widget.dropdown_elem.hasClass('mobile'));

            viewport.set(1000);
            $(window).trigger('resize');
            assert.notOk(widget.dropdown_elem.hasClass('mobile'));
        });
    });

    QUnit.module('ColorSwatch', hooks => {
        hooks.beforeEach(() => {
            ColorWidget.initialize();
            widget = elem.data('color_widget');
        });

        QUnit.test('constructor', assert => {
            widget.create_swatch();
            assert.deepEqual(widget.color_swatches[0].color, widget.picker.color.hsl);
        });

        QUnit.test.skip('find_match', assert => {
            let color = { h: 100, s: 100, l: 75 };
            let colors = [
                { h: 100, s: 100, l: 50 },
                { h: 100, s: 100, l: 20 },
                { h: 100, s: 50, l: 50 }
            ];

            // create first swatch
            widget.picker.color.hsl = color;
            widget.create_swatch();

            // create other swatches
            for (let color of colors) {
                widget.picker.color.hsl = color;
                widget.create_swatch();
            }
            assert.strictEqual(widget.color_swatches.length, 4);

            // attempt to create same swatches again
            for (let color of colors) {
                widget.picker.color.hsl = color;
                widget.create_swatch();
            }
            assert.strictEqual(widget.color_swatches.length, 4);
        });

        QUnit.test('destroy swatch', assert => {
            let color1 = { h: 100, s: 100, l: 75 };
            let color2 = { h: 200, s: 100, l: 75 };

            // create swatch
            widget.picker.color.hsl = color1;
            widget.create_swatch();
            assert.strictEqual(widget.color_swatches.length, 1);

            // create second swatch
            widget.picker.color.hsl = color2;
            widget.create_swatch();
            assert.strictEqual(widget.color_swatches.length, 2);

            // delete swatch
            widget.remove_swatch();
            assert.strictEqual(widget.color_swatches.length, 1);

            // delete second swatch
            widget.remove_swatch();
            assert.strictEqual(widget.color_swatches.length, 0);

            assert.strictEqual(widget.picker.color.hexString, '#ffffff');
        });

        QUnit.test('select swatch', assert => {
            let colors = [
                {h: 100, s: 100, l: 50},
                {h: 100, s: 100, l: 20},
                {h: 100, s: 50, l: 50}
            ];
            for (let color of colors) {
                widget.picker.color.hsl = color;
                widget.create_swatch();
            }

            // newest created element is active
            assert.deepEqual(widget.active_swatch, widget.color_swatches[2]);
            assert.deepEqual(widget.hsl, widget.color_swatches[2].color.hsl);

            // click on first swatch
            widget.color_swatches[0].elem.trigger('click');
            assert.deepEqual(widget.active_swatch, widget.color_swatches[0]);
            assert.deepEqual(widget.hsl, widget.color_swatches[0].color.hsl);
        });
    });

    QUnit.module('ColorHSLInput', hooks => {
        hooks.beforeEach(() => {
            ColorWidget.initialize();
            widget = elem.data('color_widget');
        });

        QUnit.test('constructor', assert => {
            assert.ok(widget.hsl_display.elem.is('div.hsl-display'));
            assert.ok(widget.hsl_display.hue_input
                .is('input.h[type="number"][min="0"][max="360"]')
            );
            assert.ok(widget.hsl_display.saturation_input
                .is('input.s[type="number"][min="0"][max="100"]')
            );
            assert.ok(widget.hsl_display.lightness_input
                .is('input.l[type="number"][min="0"][max="100"]')
            );
        });

        QUnit.test('get/set hsl', assert => {
            // hsl on init
            assert.deepEqual(widget.hsl_display.value, widget.color.hsl);

            // set hsl
            widget.picker.color.hsl = { h: 100, s: 100, l: 20 };
            assert.strictEqual(widget.hsl_display.hue_input.val(), "100");
            assert.strictEqual(widget.hsl_display.saturation_input.val(), "100");
            assert.strictEqual(widget.hsl_display.lightness_input.val(), "20");

            // input h
            widget.hsl_display.hue_input.val(200);
            widget.hsl_display.hue_input.trigger('input');
            assert.deepEqual(widget.color.hsl, widget.hsl_display.value);

            // input s
            widget.hsl_display.saturation_input.val(80);
            widget.hsl_display.saturation_input.trigger('input');
            assert.deepEqual(widget.color.hsl, widget.hsl_display.value);

            // input h
            widget.hsl_display.lightness_input.val(50);
            widget.hsl_display.lightness_input.trigger('input');
            assert.deepEqual(widget.color.hsl, widget.hsl_display.value);
        });
    });

    QUnit.module('ColorHexInput', hooks => {
        hooks.beforeEach(() => {
            ColorWidget.initialize();
            widget = elem.data('color_widget');
        });

        QUnit.test('constructor', assert => {
            assert.ok(widget.hex_display.elem.is('div.hex-display'));
            assert.ok(widget.hex_display.input
                .is('input[spellcheck="false"][maxlength="7"]')
            );
        });

        QUnit.test('get/set value', assert => {
            // hex on init
            assert.strictEqual(widget.color.hexString, widget.hex_display.value);

            // set hex
            widget.hex_display.value = "#cccccc";
            assert.strictEqual(
                widget.hex_display.input.val(),
                widget.hex_display.value
            );

            // trigger input
            widget.hex_display.input.val("#ffffff");
            widget.hex_display.input.trigger('input');
            assert.strictEqual(widget.color.hexString, "#ffffff");

            // empty input
            widget.hex_display.input.val("");
            widget.hex_display.input.trigger('input');
            assert.strictEqual(widget.hex_display.input.val(), "#");
        });
    });
});
