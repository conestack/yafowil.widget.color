import {ColorWidget} from '../src/widget.js';

QUnit.module('ColorWidget', hooks => {
    let elem = $('<input class="color-picker"/>');

    hooks.before(() => {
        $('body').append('<div id="container" />');
    });
    hooks.beforeEach(() => {
        $('#container').append(elem);
    });
    hooks.afterEach(() => {
        $('#container').empty();
    });
    hooks.after(() => {
        $('#container').empty().remove();
    });

    QUnit.test.todo('initialize', assert => {
        ColorWidget.initialize();
        let widget = elem.data('color_widget');
        assert.ok(widget.elem.attr('spellcheck'), false);
    });

    QUnit.test.only('default constructor', assert => {
        let widget = new ColorWidget(elem);
        assert.strictEqual(widget.elem.attr('spellcheck'), 'false');
        assert.strictEqual(widget.elem.attr('maxlength'), '7');

        // preview element
        assert.ok(widget.preview_elem.hasClass('color-picker-color'));

        assert.strictEqual(widget.color, '#ffffff');
        assert.strictEqual(widget.color_swatches.length, 0);
        assert.strictEqual(widget.elem.val(), '#ffffff');
        // for some reason, hex white gets transformed to rgb value
        assert.strictEqual(widget.preview_elem.css('background-color'), 'rgb(255, 255, 255)');

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

    QUnit.test.only('init_options: hsl_display', assert => {
        let options = {
            hsl_display: true
        }
        let widget = new ColorWidget(elem, options);
        assert.ok(widget.hsl_display.hasClass('hsl-display'));
        assert.strictEqual(widget.hsl_display.children('div').length, 3);
    });

    QUnit.test.only('init_options: hex_display', assert => {
        let widget = new ColorWidget(elem, {hex_display: true});
        assert.ok(widget.hex_display.hasClass('hex-display'));
        assert.strictEqual(widget.hex_display.children('input').length, 1);
        assert.strictEqual(widget.hex_display.val(), widget.picker.color.hexString);
    });

    QUnit.test.only('init_swatches', assert => {
        // set json string
        let swatch1 = {hex: '#e6f96c', hsl: {h: 68, s: 93, l: 70}};
        let swatch2 = {hex: '#00db7f', hsl: {h: 155, s: 100, l: 43}};
        let json_str = JSON.stringify([swatch1, swatch2]);
        localStorage.setItem("color-swatches", json_str);

        // initialize
        let widget = new ColorWidget(elem, {hex_display:true, hsl_display: true});

        // assertions
        assert.deepEqual(widget.color_swatches, [swatch1, swatch2]);
        assert.strictEqual(widget.swatches_container.css('display'), 'block');
        assert.strictEqual(widget.swatches_container.children('div').length, 2);

        // trigger click on swatch 1
        $('#e6f96c').trigger('click');
        assert.strictEqual(widget.color, '#e6f96c');
        assert.ok($('#e6f96c').hasClass('selected'));

        // trigger click on swatch 2
        $('#00db7f').trigger('click');
        assert.strictEqual(widget.color, '#00db7f');
        assert.ok($('#00db7f').hasClass('selected'));

        // remove json string
        localStorage.removeItem('color-swatches');
    });

    QUnit.test.todo('update_color', assert => {
        // initialize
        let widget = new ColorWidget(elem, {hex_display: true, hsl_display: true});

        assert.ok(true);
    });

    QUnit.test.only('update_hex_value', assert => {
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
        assert.strictEqual(widget.picker_elem.css('display'), 'none');

        // trigger on input focus
        widget.elem.trigger('focus');
        assert.strictEqual(widget.picker_elem.css('display'), 'block');

        // mousedown inside picker
        widget.picker_elem.trigger('mousedown');
        assert.strictEqual(widget.picker_elem.css('display'), 'block');

        // mousedown outside picker
        $('body').trigger('mousedown');
        assert.strictEqual(widget.picker_elem.css('display'), 'none');

        // click on preview elem
        widget.preview_elem.trigger('click');
        assert.strictEqual(widget.picker_elem.css('display'), 'block');
        widget.preview_elem.trigger('click');
        assert.strictEqual(widget.picker_elem.css('display'), 'none');
    });

    QUnit.test.only('handle_keypress', assert => {
        // initialize
        let widget = new ColorWidget(elem);
        assert.strictEqual(widget.picker_elem.css('display'), 'none');

        // trigger input focus
        widget.elem.trigger('focus');
        assert.strictEqual(widget.picker_elem.css('display'), 'block');

        // trigger Enter key
        let enter_key = $.Event('keydown', {key: 'Enter'});
        $(window).trigger(enter_key);
        assert.strictEqual(widget.picker_elem.css('display'), 'none');

        // trigger input focus
        widget.elem.trigger('focus');
        assert.strictEqual(widget.picker_elem.css('display'), 'block');

        // trigger Escape key
        let escape_key = $.Event('keydown', {key: 'Escape'});
        $(window).trigger(escape_key);
        assert.strictEqual(widget.picker_elem.css('display'), 'none');
    });

    QUnit.test.only('hide_elem', assert => {
        // initialize
        let widget = new ColorWidget(elem);
        assert.strictEqual(widget.picker_elem.css('display'), 'none');

        // trigger input focus
        widget.elem.trigger('focus');
        assert.strictEqual(widget.picker_elem.css('display'), 'block');

        // click close btn
        widget.close_btn.trigger('click');
        assert.strictEqual(widget.picker_elem.css('display'), 'none');
        assert.false(widget.elem.is(':focus'));
    });

    QUnit.module('swatches', () => {
        QUnit.test('create_swatch', assert => {
            // initialize
            let widget = new ColorWidget(elem);
        });
    });
});
