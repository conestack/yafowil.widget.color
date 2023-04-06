import {ColorWidget, lookup_callback} from '../src/widget.js';
import {ColorSwatch, LockedSwatchesContainer} from '../src/components.js';
import {register_array_subscribers} from '../src/widget.js';
import $ from 'jquery';

let elem = $('<input class="color-picker"/>');
let widget;

QUnit.module('ColorWidget', hooks => {
    let _array_subscribers = {
        on_add: []
    };

    hooks.before(() => {
        $('body').append('<div id="container" />');
    });
    hooks.beforeEach(() => {
        $('#container').append(elem);
    });
    hooks.afterEach(() => {
        $('#container').empty();
        for (let key in localStorage) {
            if (key == 'yafowil-color-swatches') {
              localStorage.removeItem(key);
            }
          }
        widget = null;
        localStorage.removeItem("yafowil-color-swatches");
    });
    hooks.after(() => {
        $('#container').empty().remove();
        _array_subscribers = null;
    });

    QUnit.test('initialize', assert => {
        ColorWidget.initialize();
        widget = elem.data('yafowil-color');
        assert.ok(widget.elem.attr('spellcheck'), false);
        assert.deepEqual(widget.elem, elem);
    });

    QUnit.test('on_update, on_close', assert => {
        window.on_update = () => {
            assert.step('on_update');
        };
        window.yafowil_color_test = {
            on_close: () => {
                assert.step('on_close');
            }
        }
        elem.data('on_update', 'on_update')
        elem.data('on_close', 'yafowil_color_test.on_close')
        ColorWidget.initialize();
        widget = elem.data('yafowil-color');
        widget.color_picker.open();
        widget.color_picker.update_color();
        widget.color_picker.close();

        assert.verifySteps([
            'on_update',
            'on_close'
        ]);

        window.yafowil_color_test = undefined;
        window.on_update = undefined;

        // lookup_callback: no path
        assert.strictEqual(lookup_callback(), null);
        // path not found
        assert.throws(() => { lookup_callback('foo.bar') }, 'foo not found.');

        elem.val('');
    });

    QUnit.test('register_array_subscribers', assert => {
        $('#container').empty();

        // return if window.yafowil === undefined
        register_array_subscribers();
        assert.deepEqual(_array_subscribers['on_add'], []);

        // patch yafowil_array
        window.yafowil_array = {
            on_array_event: function(evt_name, evt_function) {
                _array_subscribers[evt_name] = evt_function;
            },
            inside_template(elem) {
                return elem.parents('.arraytemplate').length > 0;
            }
        };
        register_array_subscribers();

        // create table DOM
        let table = $('<table />')
            .append($('<tr id="row" />'))
            .append($('<td />'))
            .appendTo('body');

        $('td', table).addClass('arraytemplate');
        elem.appendTo($('td', table));

        // invoke array on_add - returns
        let context = $('#row');
        _array_subscribers['on_add'].apply(null, context);
        widget = elem.data('yafowil-color');
        assert.notOk(widget);
        $('td', table).removeClass('arraytemplate');

        // invoke array on_add
        elem.attr('id', '');
        _array_subscribers['on_add'].apply(null, context);
        widget = elem.data('yafowil-color');
        assert.ok(widget);

        table.remove();
    });

    QUnit.test('default constructor', assert => {
        ColorWidget.initialize();
        widget = elem.data('yafowil-color');
        assert.strictEqual(widget.elem.attr('spellcheck'), 'false');

        // preview element
        assert.ok(widget.color_picker.preview.elem.hasClass('yafowil-color-picker-color'));
        assert.notOk(widget.locked_swatches);
        assert.notOk(widget.user_swatches);
        assert.strictEqual(widget.elem.val(), '');
        assert.strictEqual(
            widget.color_picker.preview.layer.css('background-color'),
            'rgba(0, 0, 0, 0)'
        );
        // iro picker exists
        assert.ok(widget.color_picker.picker);
    });

    QUnit.test('switch between box and wheel', assert => {
        let widget = new ColorWidget(elem, {sliders: ['box', 'wheel']});

        assert.strictEqual(
            $('div.IroBox', widget.color_picker.picker_container).css('display'),
            'flex'
        );
        assert.strictEqual(
            $('div.IroWheel', widget.color_picker.picker_container).css('display'),
            'none'
        );
        assert.ok(widget.color_picker.switch_btn.is('button.iro-switch-toggle'));
        assert.ok($('i.glyphicon.glyphicon-refresh', widget.color_picker.switch_btn).length);

        // trigger switch
        widget.color_picker.switch_btn.trigger('click');
        assert.strictEqual(
            $('div.IroBox', widget.color_picker.picker_container).css('display'),
            'none'
        );
        assert.strictEqual(
            $('div.IroWheel', widget.color_picker.picker_container).css('display'),
            'flex'
        );
    });

    QUnit.test('switch between wheel and box', assert => {
        let widget = new ColorWidget(elem, {sliders: ['wheel', 'box']});

        assert.strictEqual(
            $('div.IroWheel', widget.color_picker.picker_container).css('display'),
            'flex'
        );
        assert.strictEqual(
            $('div.IroBox', widget.color_picker.picker_container).css('display'),
            'none'
        );
        assert.ok(widget.color_picker.switch_btn.is('button.iro-switch-toggle'));
        assert.ok($('i.glyphicon.glyphicon-refresh', widget.color_picker.switch_btn).length);

        // trigger switch
        widget.color_picker.switch_btn.trigger('click');
        assert.strictEqual(
            $('div.IroWheel', widget.color_picker.picker_container).css('display'),
            'none'
        );
        assert.strictEqual(
            $('div.IroBox', widget.color_picker.picker_container).css('display'),
            'flex'
        );
    });

    QUnit.test('preview_elem', assert => {
        // create preview elem
        let prev_elem = $('<div id="preview" style="width:2px; height:2px" />');
        let options = {
            preview_elem: prev_elem,
            color: '#ffffff'
        }
        let widget = new ColorWidget(elem, options);
        // preview element is set
        assert.ok(widget.color_picker.preview.elem.is('div#preview'));
        assert.strictEqual(widget.color_picker.preview.color, widget.color_picker.color.rgbaString);
        prev_elem.remove();
    });

    QUnit.test('input', assert => {
        ColorWidget.initialize();
        widget = elem.data('yafowil-color');

        // correct hex input
        widget.elem.val('#cccccc');
        widget.elem.trigger('input');
        widget.elem.trigger('focusout');
        assert.strictEqual(widget.color_picker.picker.color.hexString, '#cccccc');

        // empty input
        widget.elem.val('');
        widget.elem.trigger('input');
        widget.elem.trigger('focusout');
        assert.strictEqual(widget.elem.val(), '');

        // correct hex input
        widget.elem.val('#213öasd');
        widget.elem.trigger('input');
        widget.elem.trigger('focusout');
        assert.strictEqual(widget.color_picker.picker.color.hexString, '#cccccc');
    });

    QUnit.test('kelvin input', assert => {
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff',
            format: 'kelvin',
            temperature: {min: 3000, max: 8000}
        });

        widget.elem.val(6000);
        widget.elem.trigger('input');
        widget.elem.trigger('focusout');
        // issue with kelvin conversion in original iro.js
        // this test utilizes a modified fork.
        assert.strictEqual(parseInt(widget.color_picker.picker.color.kelvin), 6000);

        // input events under minimum character length
        widget.elem.val(5);
        widget.elem.trigger('input');
        widget.elem.trigger('focusout');
        assert.strictEqual(parseInt(widget.color_picker.picker.color.kelvin), 3000);
        widget.elem.val(58);
        widget.elem.trigger('input');
        widget.elem.trigger('focusout');
        assert.strictEqual(parseInt(widget.color_picker.picker.color.kelvin), 3000);
        widget.elem.val(582);
        widget.elem.trigger('input');
        widget.elem.trigger('focusout');
        assert.strictEqual(parseInt(widget.color_picker.picker.color.kelvin), 3000);
        // value changes if over minimum value
        widget.elem.val(5823);
        widget.elem.trigger('input');
        widget.elem.trigger('focusout');
        assert.strictEqual(parseInt(widget.color_picker.picker.color.kelvin), 5823);
        // value caps if over maximum value
        widget.elem.val(58234);
        widget.elem.trigger('input');
        widget.elem.trigger('focusout');
        assert.strictEqual(parseInt(widget.color_picker.picker.color.kelvin), 8000);
        // value caps if under minimum value
        widget.elem.val(1234);
        widget.elem.trigger('input');
        widget.elem.trigger('focusout');
        assert.strictEqual(parseInt(widget.color_picker.picker.color.kelvin), 3000);
    });

    QUnit.test('open', assert => {
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff',
            open_on_focus: true
        });
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'none');

        // trigger on input focus
        widget.elem.trigger('focus');
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'block');

        // mousedown inside picker
        widget.color_picker.dropdown_elem.trigger('mousedown');
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'block');

        // mousedown outside picker
        $('body').trigger('mousedown');
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'none');

        // click on preview elem
        widget.color_picker.preview.elem.trigger('click');
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'block');
        widget.color_picker.preview.elem.trigger('click');
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'none');
    });

    QUnit.test('on_keydown', assert => {
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff',
            locked_swatches: [
                '#ff0000',
                '#4287f5'
            ],
            user_swatches: true,
            open_on_focus: true
        });
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'none');

        // trigger input focus
        widget.elem.trigger('focus');
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'block');

        // trigger Enter key
        let enter_key = $.Event('keydown', {key: 'Enter'});
        $(window).trigger(enter_key);
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'none');

        // trigger input focus
        widget.elem.trigger('focus');
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'block');

        // trigger Escape key
        let escape_key = $.Event('keydown', {key: 'Escape'});
        $(window).trigger(escape_key);
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'none');

        // add user swatches
        widget.elem.trigger('focus');
        widget.color_picker.picker.color.hexString = '#dddddd';
        widget.color_picker.user_swatches.add_color_btn.trigger('click');
        widget.color_picker.picker.color.hexString = '#eeeeee';
        widget.color_picker.user_swatches.add_color_btn.trigger('click');

        let user_swatches = widget.color_picker.user_swatches.swatches,
            locked_swatches = widget.color_picker.locked_swatches.swatches;
        // do not activate added swatch
        assert.deepEqual(
            widget.color_picker.active_swatch,
            null
        );

        // trigger arrow keys
        let arrow_left = $.Event('keydown', {key: 'ArrowLeft'}),
            arrow_right = $.Event('keydown', {key: 'ArrowRight'});

        // activate last swatch
        widget.color_picker.active_swatch = user_swatches[1];
        // trigger right on last user swatch
        $(window).trigger(arrow_right);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            user_swatches[1]
        );
        // trigger left on last user swatch
        $(window).trigger(arrow_left);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            user_swatches[0]
        );
        // trigger left on first user swatch
        $(window).trigger(arrow_left);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            locked_swatches[1]
        );
        // trigger left on last locked swatch
        $(window).trigger(arrow_left);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            locked_swatches[0]
        );
        // trigger left on first locked swatch
        $(window).trigger(arrow_left);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            locked_swatches[0]
        );
        // trigger right on first locked swatch
        $(window).trigger(arrow_right);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            locked_swatches[1]
        );
        // trigger right on last locked swatch
        $(window).trigger(arrow_right);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            user_swatches[0]
        );
        // trigger right on first user swatch
        $(window).trigger(arrow_right);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            user_swatches[1]
        );
    });

    QUnit.test('on_keydown - no swatches', assert => {
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff',
            locked_swatches: false,
            user_swatches: false
        });
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'none');

        // trigger arrow keys
        widget.elem.trigger('focus');
        let arrow_left = $.Event('keydown', {key: 'ArrowLeft'}),
            arrow_right = $.Event('keydown', {key: 'ArrowRight'});

        // trigger left
        $(window).trigger(arrow_left);
        assert.strictEqual(widget.color_picker.active_swatch, undefined);
        // trigger right
        $(window).trigger(arrow_right);
        assert.strictEqual(widget.color_picker.active_swatch, undefined);
    });

    QUnit.test('on_keydown - locked swatches', assert => {
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff',
            locked_swatches: [
                '#ff0000',
                '#eeeeee'
            ],
            user_swatches: false,
            open_on_focus: true
        });
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'none');

        let locked_swatches = widget.color_picker.locked_swatches.swatches;
        assert.notOk(widget.color_picker.active_swatch);

        widget.color_picker.active_swatch = locked_swatches[0];

        // trigger arrow keys
        widget.elem.trigger('focus');
        let arrow_left = $.Event('keydown', {key: 'ArrowLeft'}),
            arrow_right = $.Event('keydown', {key: 'ArrowRight'});

        // trigger right
        $(window).trigger(arrow_right);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            locked_swatches[1]
        );
        // trigger right
        $(window).trigger(arrow_right);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            locked_swatches[1]
        );
        // trigger left
        $(window).trigger(arrow_left);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            locked_swatches[0]
        );
        // trigger left
        $(window).trigger(arrow_left);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            locked_swatches[0]
        );
    });

    QUnit.test('on_keydown - user swatches', assert => {
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff',
            locked_swatches: false,
            user_swatches: true,
            open_on_focus: true
        });
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'none');

        // add user swatches
        widget.elem.trigger('focus');
        widget.color_picker.picker.color.hexString = '#dddddd';
        widget.color_picker.user_swatches.add_color_btn.trigger('click');
        widget.color_picker.picker.color.hexString = '#cccccc';
        widget.color_picker.user_swatches.add_color_btn.trigger('click');

        let user_swatches = widget.color_picker.user_swatches.swatches;
        assert.notOk(widget.color_picker.active_swatch);
        widget.color_picker.active_swatch = user_swatches[1];

        // trigger arrow keys
        let arrow_left = $.Event('keydown', {key: 'ArrowLeft'}),
            arrow_right = $.Event('keydown', {key: 'ArrowRight'});

        // trigger right
        $(window).trigger(arrow_right);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            user_swatches[1]
        );
        // trigger right
        $(window).trigger(arrow_right);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            user_swatches[1]
        );
        // trigger left
        $(window).trigger(arrow_left);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            user_swatches[0]
        );
        // trigger left
        $(window).trigger(arrow_left);
        assert.deepEqual(
            widget.color_picker.active_swatch,
            user_swatches[0]
        );

        widget.color_picker.active_swatch = null;
    });

    QUnit.test('on_keydown - no active swatch, no swatches', assert => {
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff',
            locked_swatches: false,
            user_swatches: false
        });
        // trigger arrow keys
        let arrow_left = $.Event('keydown', {key: 'ArrowLeft'}),
            arrow_right = $.Event('keydown', {key: 'ArrowRight'});
        // trigger right
        $(window).trigger(arrow_right);
        assert.strictEqual(widget.color_picker.active_swatch, undefined);
        // trigger left
        $(window).trigger(arrow_left);
        assert.strictEqual(widget.color_picker.active_swatch, undefined);
    });

    QUnit.test('close', assert => {
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff',
            open_on_focus: true
        });
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'none');

        // trigger input focus
        widget.elem.trigger('focus');
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'block');

        // click close btn
        widget.color_picker.close_btn.trigger('click');
        assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'none');
        assert.false(widget.elem.is(':focus'));
    });

    QUnit.test('custom dimensions', assert => {
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff',
            box_width: 600,
            box_height: 300
        });

        assert.strictEqual(widget.color_picker.picker.state.width, 600);
        assert.strictEqual(widget.color_picker.picker.state.boxHeight, 300);
    });

    QUnit.test('LockedSwatchesContainer', assert => {
        let locked_swatches = [
            '#ff0000',
            '#aa2255',
            '#4287f5'
        ];
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff',
            locked_swatches: locked_swatches
        });

        assert.ok(widget.color_picker.locked_swatches);
        assert.ok(widget.color_picker.locked_swatches.elem.is('div.color-picker-recent'));
        for (let i=0; i<widget.color_picker.locked_swatches.swatches.length; i++) {
            let swatch = widget.color_picker.locked_swatches.swatches[i];
            assert.strictEqual(
                swatch.color.hexString,
                locked_swatches[i]
            )
            assert.true(swatch.locked);
            assert.ok(swatch.elem.hasClass('locked'));
            assert.ok($('div.swatch-mark', swatch.elem).length);
        }
    });

    QUnit.test('LockedSwatchesContainer no swatches', assert => {
        let locked_swatches = [];
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff',
            locked_swatches: locked_swatches
        });

        assert.ok(widget.color_picker.locked_swatches);
        assert.ok(widget.color_picker.locked_swatches.elem.is('div.color-picker-recent'));
        assert.deepEqual(widget.color_picker.locked_swatches.swatches, []);
    });

    QUnit.test('LockedSwatchesContainer parse_swatch', assert => {
        let locked_swatches = [
            '#ff0000',                      // hex
            '#baeeee61',                    // hex8
            [255, 255, 255, 0.5],           // rgba array
            6000,                           // kelvin int
            '7000',                         // kelvin str
            {'r': 0, 'g': 255, 'b': 0},     // rgb obj
            true                            // invalid value (bool)
        ];
        let dd_elem = $('<div id="dd" />').appendTo('body');
        let widget = {
            dropdown_elem: dd_elem
        }
        // initialize
        let l_widget = new LockedSwatchesContainer(widget);

        let color1 = l_widget.parse_swatch(locked_swatches[0]);
        assert.strictEqual(color1.kelvin, false);
        assert.strictEqual(color1.color.hexString, '#ff0000');
        let color2 = l_widget.parse_swatch(locked_swatches[1]);
        assert.strictEqual(color2.kelvin, false);
        assert.strictEqual(color2.color.hex8String, '#baeeee61');
        let color3 = l_widget.parse_swatch(locked_swatches[2]);
        assert.strictEqual(color3.kelvin, false);
        assert.strictEqual(color3.color.rgbaString, 'rgba(255, 255, 255, 0.5)');
        let color4 = l_widget.parse_swatch(locked_swatches[3]);
        assert.strictEqual(color4.kelvin, true);
        assert.strictEqual(color4.color.kelvin, 6000);
        let color5 = l_widget.parse_swatch(locked_swatches[4]);
        assert.strictEqual(color5.kelvin, true);
        assert.strictEqual(color5.color.kelvin, 7000);
        let color6 = l_widget.parse_swatch(locked_swatches[5]);
        assert.strictEqual(color6.kelvin, false);
        assert.strictEqual(color6.color.rgbString, 'rgb(0, 255, 0)');
        let color7 = l_widget.parse_swatch(locked_swatches[6]);
        assert.notOk(color7);

        dd_elem.remove();
    });

    QUnit.test('no locked|user swatches', assert => {
        // initialize
        let widget = new ColorWidget(elem, {
            color: '#ffffff',
            locked_swatches: false,
            user_swatches: false
        });

        assert.strictEqual(widget.color_picker.locked_swatches, undefined);
        assert.strictEqual(widget.color_picker.user_swatches, undefined);
        assert.ok(widget.color_picker.picker_container.css('margin-bottom'), '0');
    });

    QUnit.test('LockedSwatchesContainer - locked swatches', assert => {
        widget = new ColorWidget(elem, {
            format: 'rgbString',
            locked_swatches: [
                [255, 0, 0],
                'rgb(255,0,0)',
                {r:255, g:0, b:0}
            ],
            open_on_focus: true
        }, 0);
        assert.strictEqual(widget.color_picker.locked_swatches.swatches.length, 3);
        for (let swatch of widget.color_picker.locked_swatches.swatches) {
            assert.deepEqual(swatch.color.rgb, {r:255, g:0, b:0});
        }
    })

    QUnit.module('UserSwatchesContainer', hooks => {
        QUnit.test('init_swatches', assert => {
            // mock json file
            let swatches = [
                {color: {h: 0, s: 0, l: 80}},
                {color: {h: 0, s: 100, l: 50}}
            ];
            localStorage.setItem('yafowil-color-swatches', JSON.stringify(swatches));

           // initialize
            let widget = new ColorWidget(elem, {
                color: '#ffffff',
                user_swatches: true,
                open_on_focus: true
            });

            // assertions
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 2);
            assert.strictEqual(
                widget.color_picker.user_swatches.remove_color_btn.css('display'),
                'block'
            );
            assert.strictEqual(
                widget.color_picker.user_swatches.elem.css('display'),
                'block'
            );
        });

        QUnit.test('create_swatch, remove_swatch, set_swatches', assert => {
            // initialize
            let widget = new ColorWidget(elem, {
                color: '#ffffff',
                locked_swatches: false,
                user_swatches: true,
                open_on_focus: true
            });
            assert.strictEqual(
                widget.color_picker.user_swatches.elem.css('display'),
                'none'
            );

            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 0);
            widget.elem.trigger('focus');

            // click add color
            widget.color_picker.picker.color.hexString = '#ff0000';
            widget.color_picker.user_swatches.add_color_btn.trigger('click');
            // assertions
            assert.strictEqual(
                widget.color_picker.user_swatches.elem.css('display'),
                'block'
            );
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 1);
            assert.deepEqual(
                widget.color_picker.user_swatches.swatches[0].color.hsva,
                widget.color_picker.picker.color.hsva
            );

            // add same color again
            widget.color_picker.user_swatches.add_color_btn.trigger('click');
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 1);

            // add second color
            widget.color_picker.picker.color.hexString = '#cccccc';
            widget.color_picker.user_swatches.add_color_btn.trigger('click');
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 2);
            assert.strictEqual(
                widget.color_picker.preview.layer.css('background-color'),
                'rgb(204, 204, 204)'
            );

            // click on first swatch
            widget.color_picker.user_swatches.swatches[0].elem.trigger('click');
            assert.strictEqual(widget.color_picker.color.hexString, '#ff0000');
            assert.strictEqual(
                widget.color_picker.picker.color.hexString,
                '#ff0000'
            );
            assert.strictEqual(
                widget.color_picker.preview.layer.css('background-color'),
                'rgb(255, 0, 0)'
            );
            assert.false(
                widget.color_picker.user_swatches.swatches[1].elem.hasClass('selected')
            );
            assert.ok(
                widget.color_picker.user_swatches.swatches[0].elem.hasClass('selected')
            );

            // JSON localStorage
            let swatches = [];
            for (let swatch of widget.color_picker.user_swatches.swatches) {
                swatches.push({color: swatch.color.hsva, kelvin: false});
            }
            assert.strictEqual(
                localStorage.getItem('yafowil-color-swatches'),
                JSON.stringify(swatches)
            );

            // delete swatch with button
            widget.color_picker.user_swatches.remove_color_btn.trigger('click');
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 1);
            assert.strictEqual(widget.color_picker.color.hexString, '#ffffff');
            assert.strictEqual(widget.color_picker.picker.color.hexString, '#ffffff');

            assert.strictEqual(widget.color_picker.dropdown_elem.css('display'), 'block');

            // delete swatch with keypress
            widget.color_picker.user_swatches.swatches[0].elem.trigger('click');
            assert.deepEqual(
                widget.color_picker.active_swatch,
                widget.color_picker.user_swatches.swatches[0]
            );
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 1);
            let delKey = new $.Event('keydown', { key: 'Delete' });
            $(window).trigger(delKey);
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 0);
            assert.strictEqual(
                widget.color_picker.picker.color.hexString,
                '#ffffff'
            );
            assert.notOk(localStorage.getItem('yafowil-color-swatches'));
        });

        QUnit.test('create_swatch - same as locked swatch color', assert => {
            // initialize
            let widget = new ColorWidget(elem, {
                color: '#ffffff',
                locked_swatches: ['#ff0000'],
                user_swatches: true
            });

            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 0);
            widget.elem.trigger('focus');

            // click add color
            widget.color_picker.picker.color.hexString = '#ff0000';
            widget.color_picker.user_swatches.add_color_btn.trigger('click');
            // assertions
            assert.strictEqual(
                widget.color_picker.user_swatches.elem.css('display'),
                'none'
            );
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 0);
        });

        QUnit.test('no active swatch', assert => {
            // initialize
            let widget = new ColorWidget(elem, {
                color: '#ffffff',
                user_swatches: true
            }, 0);

            // add color
            widget.color_picker.picker.color.hexString = '#cccccc';
            widget.color_picker.user_swatches.add_color_btn.trigger('click');
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 1);
            assert.strictEqual(
                widget.color_picker.preview.layer.css('background-color'),
                'rgb(204, 204, 204)'
            );
            widget.color_picker.active_swatch = widget.color_picker.user_swatches.swatches[0];

            widget.color_picker.user_swatches.remove_color_btn.trigger('click');
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 0);
        });

        QUnit.test('remove locked swatch', assert => {
            // initialize
            let widget = new ColorWidget(elem, {
                color: '#ffffff',
                locked_swatches: [{h:100, s:100, v:100}],
                user_swatches: true
            }, 0);
            assert.strictEqual(
                widget.color_picker.user_swatches.elem.css('display'),
                'none'
            );
            assert.strictEqual(
                widget.color_picker.locked_swatches.elem.css('display'),
                'block'
            );
            // click on locked swatch
            widget.color_picker.locked_swatches.swatches[0].elem.trigger('click');
            widget.color_picker.user_swatches.remove_color_btn.trigger('click');
            // locked swatch has not been deleted
            assert.strictEqual($('div.color-swatch').length, 1);
        });

        QUnit.test('create over 10 swatches', assert => {
            // initialize
            let widget = new ColorWidget(elem, {
                color:'#ffffff',
                user_swatches: true
            });
            assert.strictEqual(widget.color_picker.user_swatches.elem.css('display'), 'none');

            // open menu by click
            widget.color_picker.preview.elem.trigger('click');
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 0);

            let colors = [
                '#83ee01', '#05074b', '#ae47ed', '#eb6ef2', '#c2c9a1', '#8e84b4',
                '#d8c576', '#add2b4', '#05013d', '#4edbb3', '#420c21', '#a23bf6',
                '#fe9185'
            ]
            // add swatches
            for (let i = 0; i <= 10; i++) {
                widget.color_picker.picker.color.set(colors[i]);
                widget.color_picker.user_swatches.add_color_btn.trigger('click');
            }
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 10);
        });
    });

    QUnit.module('ColorSwatch', hooks => {

        hooks.beforeEach(() => {
            widget = new ColorWidget(elem, {
                swatches: [{h:100, s:100, v:75, a:0.5}],
                user_swatches: true,
                locked_swatches: true
            });
        });

        QUnit.test('constructor', assert => {
            widget.color_picker.user_swatches.create_swatch();
            assert.deepEqual(
                widget.color_picker.user_swatches.swatches[0].color.hsl,
                widget.color_picker.picker.color.hsl
            );
        });

        QUnit.test('constructor - return cases', assert => {
            let swatches = [
                {color: '#ffd0a4', kelvin:true},
                {color:'#e1e8ff', kelvin:true},
                {color:'#ff0000', kelvin:false}
            ];
            swatches = JSON.stringify(swatches);
            localStorage.setItem('yafowil-color-swatches', swatches);
            widget = new ColorWidget(elem, {
                user_swatches: true,
                format: 'kelvin',
                temperature: {min: 5000, max: 5001}
            });
            let user_swatches = widget.color_picker.user_swatches.swatches;
            assert.strictEqual(user_swatches.length, 3);
            assert.true(user_swatches[0].invalid);
            assert.true(user_swatches[1].invalid);
            assert.true(user_swatches[2].invalid);
            localStorage.removeItem('yafowil-color-swatches');
        });

        QUnit.test('color_equals', assert => {
            let color = { h: 100, s: 100, v: 75, a: 1 };
            let colors = [
                { h: 100, s: 100, v: 50, a: 1 },
                { h: 100, s: 100, v: 20, a: 1 },
                { h: 100, s: 50, v: 50 }
            ];

            // create first swatch
            widget.color_picker.picker.color.hsva = color;
            widget.color_picker.user_swatches.create_swatch();

            // create other swatches
            for (let color of colors) {
                widget.color_picker.picker.color.hsva = color;
                widget.color_picker.user_swatches.create_swatch();
            }
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 4);

            // attempt to create same swatches again
            for (let color of colors) {
                widget.color_picker.picker.color.hsva = color;
                widget.color_picker.user_swatches.create_swatch();
            }
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 4);

            // attempt to create same as locked swatch
            widget.color_picker.picker.color.hsva = {h:100, s:100, v:75, a:1};
            widget.color_picker.user_swatches.create_swatch();

            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 4);
        });

        QUnit.test('destroy swatch', assert => {
            let color1 = { h: 100, s: 100, l: 75 },
                color2 = { h: 200, s: 100, l: 75 },
                color3 = { h: 150, s: 100, l: 75 },
                color4 = { h: 120, s: 100, l: 75 };

            // create swatch
            widget.color_picker.picker.color.hsl = color1;
            widget.color_picker.user_swatches.create_swatch();
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 1);
            assert.true(widget.color_picker.user_swatches.swatches[0].selected);

            // create second swatch
            widget.color_picker.picker.color.hsl = color2;
            widget.color_picker.user_swatches.create_swatch();
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 2);
            assert.true(widget.color_picker.user_swatches.swatches[1].selected);

            // delete swatch
            widget.color_picker.active_swatch = widget.color_picker.user_swatches.swatches[1];
            widget.color_picker.user_swatches.remove_swatch();
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 1);

            // delete second swatch
            widget.color_picker.active_swatch = widget.color_picker.user_swatches.swatches[0];
            widget.color_picker.user_swatches.remove_swatch();
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 0);

            assert.strictEqual(widget.color_picker.picker.color.hexString, '#ffffff');

            // create invalid swatch
            widget.color_picker.picker.color.hsl = color3;
            widget.color_picker.user_swatches.create_swatch();
            assert.strictEqual(widget.color_picker.user_swatches.swatches.length, 1);
            widget.color_picker.user_swatches.swatches[0].invalid = true;
            widget.color_picker.user_swatches.swatches[0].destroy();
            assert.notOk(widget.color_picker.active_swatch);

            // create locked swatch
            widget.color_picker.locked_swatches.init_swatches([color3]);
            assert.strictEqual(widget.color_picker.locked_swatches.swatches.length, 1);
            widget.color_picker.locked_swatches.swatches[0].destroy();
            assert.notOk(widget.color_picker.active_swatch);
        });

        QUnit.test('select swatch', assert => {
            let colors = [
                {h: 100, s: 100, l: 50},
                {h: 100, s: 100, l: 20},
                {h: 100, s: 50, l: 50}
            ];
            for (let color of colors) {
                widget.color_picker.picker.color.set(color);
                widget.color_picker.user_swatches.create_swatch();
            }

            // click on first swatch
            widget.color_picker.user_swatches.swatches[0].elem.trigger('click');
            assert.true(widget.color_picker.user_swatches.swatches[0].elem.hasClass('selected'));
            assert.deepEqual(
                widget.color_picker.active_swatch,
                widget.color_picker.user_swatches.swatches[0]
            );
            assert.deepEqual(
                widget.color_picker.color.hsl,
                widget.color_picker.user_swatches.swatches[0].color.hsl
            );

            // unclick first swatch
            widget.color_picker.user_swatches.swatches[0].elem.trigger('click');
            assert.false(widget.color_picker.user_swatches.swatches[0].elem.hasClass('selected'));
            assert.notOk(widget.color_picker.active_swatch);
            // deselecting resets color to last color before swatch was clicked
            assert.deepEqual(
                widget.color_picker.color.hsl,
                widget.color_picker.user_swatches.swatches[2].color.hsl
            );
        });
    });

    QUnit.test('Opts', assert => {
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
        assert.strictEqual(widget.color_picker.picker.props.boxHeight, opts.box_height);
        assert.strictEqual(widget.color_picker.picker.props.width, opts.box_width);
        // kelvin slider with index 6
        assert.strictEqual(
            widget.color_picker.picker.props.layout[6].options.minTemperature,
           opts.temperature.min
        );
        assert.strictEqual(
            widget.color_picker.picker.props.layout[6].options.maxTemperature,
           opts.temperature.max
        );
        assert.strictEqual(widget.color_picker.picker.color.rgbaString, elem.val());
    });

    QUnit.test('hex8String', assert => {
        let opts = {
            color: '#f00',
            sliders: ['h', 'a'],
            format: 'hex8String',
            temperature: {min: 4000, max: 10000},
        }
        widget = new ColorWidget(elem, opts, 0);
        assert.strictEqual(widget.elem.attr('maxlength'), "9");
        assert.true(widget.color_picker.type_alpha);
    });
});
