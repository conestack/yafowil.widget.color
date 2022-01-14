import {ColorWidget} from '../src/widget.js';

QUnit.module('ColorWidget', hooks => {
    let elem = $('<input class="color-picker"/>');
    let widget;

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

    QUnit.test.only('initialize', assert => {
        ColorWidget.initialize();
        widget = elem.data('color_widget');
        assert.ok(widget.elem.attr('spellcheck'), false);
        assert.deepEqual(widget.elem, elem);
    });

    QUnit.test.only('default constructor', assert => {
        ColorWidget.initialize();
        widget = elem.data('color_widget');
        assert.strictEqual(widget.elem.attr('spellcheck'), 'false');
        assert.strictEqual(widget.elem.attr('maxlength'), '7');

        // preview element
        assert.ok(widget.preview_elem.hasClass('color-picker-color'));

        assert.strictEqual(widget.hex, '#ffffff');
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

    QUnit.test.only('preview_elem', assert => {
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

    QUnit.test.skip('init_options: hsl_display', assert => {
        let options = {
            hsl_display: true
        }
        let widget = new ColorWidget(elem, options);
        assert.ok(widget.hsl_display.hasClass('hsl-display'));
        assert.strictEqual(widget.hsl_display.children('div').length, 3);
    });

    QUnit.skip('init_options: hex_display', assert => {
        let widget = new ColorWidget(elem, {hex_display: true});
        assert.ok(widget.hex_display.hasClass('hex-display'));
        assert.strictEqual(widget.hex_display.children('input').length, 1);
        assert.strictEqual(
            widget.hex_display.val(),
            widget.picker.color.hexString
        );
    });

    QUnit.test.skip('init_swatches', assert => {
        // set json string
        let swatch1 = {hex: '#e6f96c', hsl: {h: 68, s: 93, l: 70}};
        let swatch2 = {hex: '#00db7f', hsl: {h: 155, s: 100, l: 43}};
        let json_str = JSON.stringify([swatch1, swatch2]);
        localStorage.setItem("color-swatches", json_str);

        // initialize
        let widget = new ColorWidget(elem, {hex_display: true, hsl_display: true});
        // assertions
        assert.deepEqual(widget.color_swatches, [swatch1, swatch2]);
        assert.strictEqual(widget.swatches_container.css('display'), 'block');
        assert.strictEqual(widget.swatches_container.children('div').length, 2);

        // trigger click on swatch 1
        $('#e6f96c').trigger('click');
        assert.strictEqual(widget.hex, '#e6f96c');
        assert.ok($('#e6f96c').hasClass('selected'));

        // trigger click on swatch 2
        $('#00db7f').trigger('click');
        assert.strictEqual(widget.hex, '#00db7f');
        assert.ok($('#00db7f').hasClass('selected'));
    });

    QUnit.test('update_hsl_value', assert => {
        // initialize
        let widget = new ColorWidget(elem, {hex_display: true, hsl_display: true});
        // initial color
        assert.deepEqual(widget.picker.color.hsl, {h:0, s:0, l:100});

        $('input.l', widget.hsl_display).val(10).trigger('input');
        assert.deepEqual(widget.picker.color.hsl, {h:0, s:0, l:10});

        $('input.h', widget.hsl_display).val(100).trigger('input');
        assert.deepEqual(widget.picker.color.hsl, {h:100, s:0, l:10});

        $('input.s', widget.hsl_display).val(10).trigger('input');
        assert.deepEqual(widget.picker.color.hsl, {h:100, s:10, l:10});
    });

    QUnit.test('update_hex_value', assert => {
        // initialize
        let widget = new ColorWidget(elem, {hex_display: true});

        // empty widget input field
        widget.elem.val('');
        widget.elem.trigger('input');
        assert.strictEqual(widget.elem.val(), '#');
        // trigger change in widget input field
        widget.elem.val('#cccccc');
        widget.elem.trigger('input');
        assert.strictEqual(widget.picker.color.hexString, '#cccccc');

        // empty hex input field
        let hex_input = $('input', widget.hex_display);
        hex_input.val('');
        hex_input.trigger('input');
        assert.strictEqual(hex_input.val(), '#');
        // trigger change in hex input field
        hex_input.val('#cccccc');
        hex_input.trigger('input');
        assert.strictEqual(widget.picker.color.hexString, '#cccccc');
    });

    QUnit.test.only('trigger_handle', assert => {
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

    QUnit.test('hide_elem', assert => {
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

    QUnit.test('create_swatch, remove_swatch, set_swatches', assert => {
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
        assert.strictEqual(
            widget.color_swatches[0].hex,
            widget.picker.color.hexString
        );
        assert.deepEqual(
            widget.color_swatches[0].hsl,
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
        assert.strictEqual(
            localStorage.getItem('color-swatches'),
            JSON.stringify(widget.color_swatches)
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

        // change array
        colors.shift();
        for (let i = 0; i < 12; i++) {
            assert.strictEqual(
                widget.color_swatches[i].hex,
                colors[i]
            );
        }
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
    })
});
