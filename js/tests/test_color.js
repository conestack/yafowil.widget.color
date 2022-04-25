import {ColorWidget} from '../src/widget.js';
import $ from 'jquery'

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
        for (let key in localStorage) {
            if (key.substring(0,14) == 'color-swatches') {
              localStorage.removeItem(key);
            }
          }
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

        // preview element
        assert.ok(widget.preview.elem.hasClass('color-picker-color'));
        assert.strictEqual(widget.swatches.length, 0);
        assert.strictEqual(widget.elem.val(), '#ffffff');
        // hex white gets transformed to rgb value
        assert.strictEqual(
            widget.preview.layer.css('background-color'),
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
        localStorage.setItem("color-swatches-0", JSON.stringify(swatches));

        // initialize
        ColorWidget.initialize();
        widget = elem.data('color_widget');

        // assertions
        assert.strictEqual(widget.swatches.length, 2);
        assert.deepEqual(widget.active_swatch, widget.swatches[1]);
        assert.ok(widget.swatches[1].elem.hasClass('selected'));
    });

    QUnit.test('preview_elem', assert => {
        // create preview elem
        let prev_elem = $('<div id="preview" style="width:2px; height:2px" />');
        let options = {
            preview_elem: prev_elem
        }
        let widget = new ColorWidget(elem, options);
        // preview element is set
        assert.ok(widget.preview.elem.is('div#preview'));
        prev_elem.remove();
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
        assert.strictEqual(widget.elem.val(), "");

        // correct hex input
        widget.elem.val('#213öasd');
        widget.elem.trigger('input');
        assert.strictEqual(widget.picker.color.hexString, "#cccccc");
    });

    QUnit.test.todo('kelvin input', assert => {
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff',
            format: 'kelvin'
        });

        widget.elem.val(6000);
        widget.elem.trigger('input');
        // this is an iro.js issue with kelvin conversion.
        assert.strictEqual(parseInt(widget.picker.color.kelvin), 5995);
    });


    QUnit.test('open', assert => {
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff'
        });
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
        widget.preview.elem.trigger('click');
        assert.strictEqual(widget.dropdown_elem.css('display'), 'block');
        widget.preview.elem.trigger('click');
        assert.strictEqual(widget.dropdown_elem.css('display'), 'none');
    });

    QUnit.test('on_keydown', assert => {
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff'
        });
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
        let widget = new ColorWidget(elem, {
            color: '#ffffff'
        });
        assert.strictEqual(widget.dropdown_elem.css('display'), 'none');

        // trigger input focus
        widget.elem.trigger('focus');
        assert.strictEqual(widget.dropdown_elem.css('display'), 'block');

        // click close btn
        widget.close_btn.trigger('click');
        assert.strictEqual(widget.dropdown_elem.css('display'), 'none');
        assert.false(widget.elem.is(':focus'));
    });

    QUnit.test('create_swatch, remove_swatch, set_swatches', assert => {
        // initialize
        let widget = new ColorWidget(elem, {color: '#ffffff'}, 0);
        assert.strictEqual(widget.swatches_container.css('display'), 'none');

        // open menu by click
        widget.preview.elem.trigger('click');
        assert.strictEqual(widget.swatches.length, 0);

        // click add color
        widget.add_color_btn.trigger('click');
        // assertions
        assert.strictEqual(widget.swatches_container.css('display'), 'block');
        assert.strictEqual(widget.swatches.length, 1);
        assert.deepEqual(
            widget.swatches[0].color.hsva,
            widget.picker.color.hsva
        );

        // add same color again
        widget.add_color_btn.trigger('click');
        assert.strictEqual(widget.swatches.length, 1);

        // add second color
        widget.picker.color.hexString = '#cccccc';
        widget.add_color_btn.trigger('click');
        assert.strictEqual(widget.swatches.length, 2);
        assert.strictEqual(
            widget.preview.layer.css('background-color'),
            'rgb(204, 204, 204)'
        );
        assert.ok(widget.swatches[1].elem.hasClass('selected'));

        // click on first swatch
        widget.swatches[0].elem.trigger('click');
        assert.strictEqual(widget.color.hexString, '#ffffff');
        assert.strictEqual(
            widget.picker.color.hexString,
            '#ffffff'
        );
        assert.strictEqual(
            widget.preview.layer.css('background-color'),
            'rgb(255, 255, 255)'
        );
        assert.false(widget.swatches[1].elem.hasClass('selected'));
        assert.ok(widget.swatches[0].elem.hasClass('selected'));

        // JSON localStorage
        let swatches = [];
        for (let swatch of widget.swatches) {
            swatches.push(swatch.color.hsva);
        }
        assert.strictEqual(
            localStorage.getItem('color-swatches-0'),
            JSON.stringify(swatches)
        );

        // delete swatch with keypress
        let delKey = $.Event('keydown', { key: 'Delete' });
        $(window).trigger(delKey);
        assert.strictEqual($('div.color-swatch').length, 1);
        assert.strictEqual(
            widget.picker.color.hexString,
            '#cccccc'
        );

        // delete swatch with button
        widget.remove_color_btn.trigger('click');
        assert.strictEqual($('div.color-swatch').length, 0);
        assert.notOk(localStorage.getItem('color-swatches'));

        assert.strictEqual(widget.color.hexString, '#ffffff');
        assert.strictEqual(widget.picker.color.hexString, '#ffffff');
    });

    QUnit.test('remove fixed swatch', assert => {
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff',
            swatches: [{h:100, s:100, v:100}]
        }, 0);
        assert.strictEqual(widget.swatches_container.css('display'), 'block');
        // click on fixed swatch
        widget.fixed_swatches[0].elem.trigger('click');
        widget.remove_color_btn.trigger('click');
        // fixed swatch has not been deleted
        assert.strictEqual($('div.color-swatch').length, 1);
    });

    QUnit.test('create over 12 swatches', assert => {
        // initialize
        let widget = new ColorWidget(elem, {color:'#ffffff'});
        assert.strictEqual(widget.swatches_container.css('display'), 'none');

        // open menu by click
        widget.preview.elem.trigger('click');
        assert.strictEqual(widget.swatches.length, 0);

        let colors = [
            '#83ee01', '#05074b', '#ae47ed', '#eb6ef2', '#c2c9a1', '#8e84b4',
            '#d8c576', '#add2b4', '#05013d', '#4edbb3', '#420c21', '#a23bf6',
            '#fe9185'
        ]
        // add swatches
        for (let i = 0; i <= 10; i++) {
            widget.picker.color.set(colors[i]);
            widget.add_color_btn.trigger('click');
        }
        assert.strictEqual(widget.swatches.length, 10);
    });

    QUnit.test('custom dimensions', assert => {
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff',
            box_width: 600,
            box_height: 300
        });

        assert.strictEqual(widget.picker.state.width, 600);
        assert.strictEqual(widget.picker.state.boxHeight, 300);
    });

    QUnit.module('ColorSwatch', hooks => {
        hooks.beforeEach(() => {
            widget = new ColorWidget(elem, {swatches: [{h:100, s:100, v:75, a:0.5}]});
        });

        QUnit.test('constructor', assert => {
            widget.create_swatch();
            assert.deepEqual(widget.swatches[0].color.hsl, widget.picker.color.hsl);
        });

        QUnit.test('color_equals', assert => {
            let color = { h: 100, s: 100, v: 75, a: 1 };
            let colors = [
                { h: 100, s: 100, v: 50, a: 1 },
                { h: 100, s: 100, v: 20, a: 1 },
                { h: 100, s: 50, v: 50 }
            ];

            // create first swatch
            widget.picker.color.hsva = color;
            widget.create_swatch();

            // create other swatches
            for (let color of colors) {
                widget.picker.color.hsva = color;
                widget.create_swatch();
            }
            assert.strictEqual(widget.swatches.length, 4);

            // attempt to create same swatches again
            for (let color of colors) {
                widget.picker.color.hsva = color;
                widget.create_swatch();
            }
            assert.strictEqual(widget.swatches.length, 4);

            // attempt to create same as fixed swatch
            widget.picker.color.hsva = {h:100, s:100, v:75, a:0.5};
            widget.create_swatch();

            assert.strictEqual(widget.swatches.length, 4);
        });

        QUnit.test('destroy swatch', assert => {
            let color1 = { h: 100, s: 100, l: 75 };
            let color2 = { h: 200, s: 100, l: 75 };

            // create swatch
            widget.picker.color.hsl = color1;
            widget.create_swatch();
            assert.strictEqual(widget.swatches.length, 1);

            // create second swatch
            widget.picker.color.hsl = color2;
            widget.create_swatch();
            assert.strictEqual(widget.swatches.length, 2);

            // delete swatch
            widget.remove_swatch();
            assert.strictEqual(widget.swatches.length, 1);

            // delete second swatch
            widget.remove_swatch();
            assert.strictEqual(widget.swatches.length, 0);

            assert.strictEqual(widget.picker.color.hexString, '#40bf00');
        });

        QUnit.test('select swatch', assert => {
            let colors = [
                {h: 100, s: 100, l: 50},
                {h: 100, s: 100, l: 20},
                {h: 100, s: 50, l: 50}
            ];
            for (let color of colors) {
                widget.picker.color.set(color);
                widget.create_swatch();
            }

            // newest created element is active
            assert.deepEqual(widget.active_swatch, widget.swatches[2]);
            assert.deepEqual(widget.color.hsl, widget.swatches[2].color.hsl);

            // click on first swatch
            widget.swatches[0].elem.trigger('click');
            assert.deepEqual(widget.active_swatch, widget.swatches[0]);
            assert.deepEqual(widget.color.hsl, widget.swatches[0].color.hsl);
        });
    });

    QUnit.test.todo('Opts', assert => {
        let opts = {
            color: '#f00',
            sliders: ['box', 'r', 'g', 'b', 'a', 'k', 'h', 's', 'v', 'x'],
            format: 'rgbaString',
            box_width: 500,
            box_height: 100,
            slider_size: 30,
            temperature: {min: 4000, max: 10000},
            disabled: true,
            show_inputs: true,
            slider_length: 100
        }
        widget = new ColorWidget(elem, opts, 0);

        assert.strictEqual(widget.picker.props.boxHeight, opts.box_height);
        assert.strictEqual(widget.picker.props.width, opts.box_width);
        // kelvin slider with index 6
        assert.strictEqual(
            widget.picker.props.layout[6].options.minTemperature,
           opts.temperature.min
        );
        assert.strictEqual(
            widget.picker.props.layout[6].options.maxTemperature,
           opts.temperature.max
        );
        assert.strictEqual(widget.picker.color.rgbaString, elem.val());
        assert.ok(true);
    });

    QUnit.test('fix_swatches', assert => {
        widget = new ColorWidget(elem, {
            swatches: [[255, 0, 0], 'rgb(255,0,0)', {r:255, g:0, b:0}, 233]
        }, 0);
        assert.strictEqual(widget.fixed_swatches.length, 3);
        for (let swatch of widget.fixed_swatches) {
            assert.deepEqual(swatch.color.rgb, {r:255, g:0, b:0});
        }
    })
});
