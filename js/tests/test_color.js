import {ColorWidget} from '../src/widget.js';

QUnit.module('ColorWidget', hooks => {
    hooks.before(() => {
        $('body').append('<div id="container" />');
    });
    hooks.beforeEach(() => {
        $('#container').append($('<input class="color-picker"/>'));
    });
    hooks.afterEach(() => {
        $('#container').empty();
    });
    hooks.after(() => {
        $('#container').empty().remove();
    });

    QUnit.test('test2', assert => {
        let widget = new ColorWidget($('input.color-picker'), {hsl_display: true, hex_display:true});
        assert.ok(widget.elem.attr('spellcheck'), false);
    });
});
