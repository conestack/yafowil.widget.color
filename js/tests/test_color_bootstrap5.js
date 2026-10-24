import $ from 'jquery';
import 'iro';
import Popper from 'popper';
import {
    BS5LockedSwatchesContainer,
    BS5UserSwatchesContainer,
} from '../src/bootstrap5/components.js';
import {
    BS5ColorPicker,
    BS5ColorWidget,
    lookup_callback,
    register_array_subscribers,
} from '../src/bootstrap5/widget.js';

QUnit.module('bootstrap5 components', (hooks) => {
    let widget;

    hooks.beforeEach(() => {
        widget = {
            elem: $('<input class="color-picker" />'),
            dropdown_elem: $('<div />').appendTo('body'),
        };
    });
    hooks.afterEach(() => {
        widget.dropdown_elem.remove();
    });

    QUnit.test('BS5LockedSwatchesContainer', (assert) => {
        const container = new BS5LockedSwatchesContainer(widget);
        assert.ok(container.elem.is('div.color-picker-recent.mt-3'));
        assert.ok(container.elem.parent().is(widget.dropdown_elem));
        assert.deepEqual(container.swatches, []);
        assert.strictEqual(container.elem.css('display'), 'none');
    });

    QUnit.test('BS5UserSwatchesContainer', (assert) => {
        const container = new BS5UserSwatchesContainer(widget);
        assert.ok(container.elem.is('div.color-picker-recent.mt-3'));
        assert.ok(container.elem.parent().is(widget.dropdown_elem));
        assert.ok(container.buttons.is('div.buttons.mt-2'));
        assert.ok(container.buttons.parent().is(widget.dropdown_elem));
        container.destroy();
    });
});

QUnit.module('bootstrap5 lookup_callback', () => {
    QUnit.test('lookup_callback', (assert) => {
        window.yafowil_color_test = { callback: () => {} };
        assert.strictEqual(lookup_callback(), null);
        assert.strictEqual(
            lookup_callback('yafowil_color_test.callback'),
            window.yafowil_color_test.callback,
        );
        assert.throws(() => {
            lookup_callback('yafowil_color_test.missing');
        }, /'missing' not found\./);
        delete window.yafowil_color_test;
    });
});

QUnit.module('bootstrap5 ColorWidget', (hooks) => {
    const orig_create_popper = Popper.createPopper;
    let poppers;
    let container;
    let elem;
    let css_link;

    hooks.before(async () => {
        css_link = document.createElement('link');
        css_link.rel = 'stylesheet';
        css_link.href = '../../src/yafowil/widget/color/resources/bootstrap5/widget.min.css';
        document.head.appendChild(css_link);
        // Wait for required styles to load
        await new Promise((resolve) => {
            css_link.onload = resolve;
        });
    });
    hooks.beforeEach(() => {
        poppers = [];
        Popper.createPopper = (reference, popper, options) => {
            const instance = { reference, popper, options, updates: 0, destroyed: false };
            instance.forceUpdate = () => {
                instance.updates++;
            };
            instance.destroy = () => {
                instance.destroyed = true;
            };
            poppers.push(instance);
            return instance;
        };
        container = $('<div />').appendTo('body');
        elem = $('<input class="color-picker" />').appendTo(container);
    });
    hooks.afterEach(() => {
        Popper.createPopper = orig_create_popper;
        container.remove();
        delete window.yafowil_array;
        localStorage.removeItem('yafowil-color-swatches');
    });
    hooks.after(() => {
        document.head.removeChild(css_link);
    });

    QUnit.test('initialize', (assert) => {
        elem.attr('data-placement', 'top')
            .attr('data-strategy', 'fixed')
            .attr('data-format', 'rgbaString')
            .attr('data-locked_swatches', '["#ff0000"]')
            .attr('data-user_swatches', 'true')
            .val('#00ff00');
        BS5ColorWidget.initialize(container);
        const widget = elem.data('yafowil-color');

        assert.ok(widget instanceof BS5ColorWidget);
        assert.ok(widget.color_picker instanceof BS5ColorPicker);
        assert.ok(widget.color_picker.locked_swatches instanceof BS5LockedSwatchesContainer);
        assert.ok(widget.color_picker.user_swatches instanceof BS5UserSwatchesContainer);
        assert.ok(widget.color_picker.dropdown_elem.is('.card.card-body.p-4.pb-3'));

        const dropdown_popper = widget.color_picker.popper;
        assert.strictEqual(dropdown_popper.reference, elem[0]);
        assert.strictEqual(dropdown_popper.popper, widget.color_picker.dropdown_elem[0]);
        assert.strictEqual(dropdown_popper.options.placement, 'top');
        assert.strictEqual(dropdown_popper.options.strategy, 'fixed');
        assert.true(dropdown_popper.options.flipVariations);

        const preview_popper = widget.color_picker.preview_popper;
        assert.strictEqual(preview_popper.reference, elem[0]);
        assert.strictEqual(preview_popper.popper, widget.color_picker.preview.elem[0]);
        assert.strictEqual(preview_popper.options.placement, 'right');
        assert.strictEqual(preview_popper.options.strategy, 'fixed');
        widget.destroy();
    });

    QUnit.test('initialize skips array template', (assert) => {
        window.yafowil_array = {
            inside_template: () => true,
        };
        BS5ColorWidget.initialize(container);
        assert.strictEqual(elem.data('yafowil-color'), undefined);
    });

    QUnit.test('defaults', (assert) => {
        const widget = new BS5ColorWidget(elem, {});
        const picker = widget.color_picker;
        assert.strictEqual(picker.popper.options.placement, 'bottom');
        assert.strictEqual(picker.locked_swatches, undefined);
        assert.strictEqual(picker.user_swatches, undefined);
        assert.ok(picker.preview.elem.is('span.yafowil-color-picker-color'));
        // placement is done by popper
        assert.strictEqual(picker.dropdown_elem[0].style.transform, '');
        widget.destroy();
    });

    QUnit.test('custom preview element', (assert) => {
        const preview = $('<div />').appendTo(container);
        const widget = new BS5ColorWidget(elem, { preview_elem: preview });
        const picker = widget.color_picker;
        assert.ok(picker.preview.elem.is(preview));
        assert.ok(preview.hasClass('yafowil-color-picker-preview'));
        assert.strictEqual(picker.preview_popper, undefined);
        assert.strictEqual(poppers.length, 1);

        picker.open();
        assert.strictEqual(picker.popper.updates, 1);
        picker.close();
        widget.destroy();
        assert.true(poppers[0].destroyed);
    });

    QUnit.test('open and close', (assert) => {
        const widget = new BS5ColorWidget(elem, {});
        const picker = widget.color_picker;
        assert.strictEqual(picker.dropdown_elem.css('display'), 'none');

        picker.open();
        assert.strictEqual(picker.dropdown_elem.css('display'), 'block');
        assert.strictEqual(picker.popper.updates, 1);
        assert.strictEqual(picker.preview_popper.updates, 1);

        // keydown is bound to window while open
        $(window).trigger($.Event('keydown', { key: 'Escape' }));
        assert.strictEqual(picker.dropdown_elem.css('display'), 'none');

        picker.open();
        assert.strictEqual(picker.dropdown_elem.css('display'), 'block');
        picker.open();
        assert.strictEqual(picker.dropdown_elem.css('display'), 'none');
        assert.strictEqual(picker.popper.updates, 3);
        widget.destroy();
    });

    QUnit.test('destroy', (assert) => {
        const widget = new BS5ColorWidget(elem, { user_swatches: true });
        const picker = widget.color_picker;
        const [dropdown_popper, preview_popper] = poppers;
        const dropdown = picker.dropdown_elem;
        picker.open();

        widget.destroy();

        assert.true(dropdown_popper.destroyed);
        assert.true(preview_popper.destroyed);
        assert.strictEqual(picker.popper, null);
        assert.strictEqual(picker.preview_popper, null);
        assert.notOk($.contains(document, dropdown[0]));
        assert.ok($.contains(document, elem[0]));
        // window handlers are unbound
        $(window).trigger($.Event('keydown', { key: 'Escape' }));
        assert.strictEqual(dropdown.css('display'), 'block');
    });

    QUnit.module('register_array_subscribers', () => {
        QUnit.test('without array widget', (assert) => {
            assert.strictEqual(register_array_subscribers(), undefined);
        });

        QUnit.test('with array widget', (assert) => {
            let on_add;
            window.yafowil_array = {
                on_array_event: (evt_name, evt_function) => {
                    assert.strictEqual(evt_name, 'on_add');
                    on_add = evt_function;
                },
                inside_template: () => false,
            };
            register_array_subscribers();

            on_add(null, container);
            const widget = elem.data('yafowil-color');
            assert.ok(widget instanceof BS5ColorWidget);
            widget.destroy();
        });
    });
});
